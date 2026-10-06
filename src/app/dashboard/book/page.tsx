import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { WIZARD_CHILD_PARAMS } from '@/features/booking/booking.params'
import type { BookingFormInput } from '@/features/booking/booking.schema'
import { BookingWizard } from '@/features/booking/components/booking-wizard'
import { childKeys } from '@/features/child/child.keys'
import { getChildrenPage } from '@/features/child/child.server'
import { guardianKeys } from '@/features/guardian/guardian.keys'
import { getGuardianProfile } from '@/features/guardian/guardian.server'
import { roomKeys } from '@/features/room/room.keys'
import { parseSessionDateParam, weekdayOf } from '@/features/room/room.params'
import { getRoom } from '@/features/room/room.server'
import { makeQueryClient } from '@/lib/query-client'
import type { Child, Paginated, RoomWithSeats } from '@/types'

export const metadata: Metadata = { title: 'Book a seat' }

type BookPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// A room named in the URL (from a room's page, or a shared link). A room that does not exist, or an
// id that is not a UUID, is simply not picked: the guardian chooses one in step 2.
async function loadRoom(id: string | undefined): Promise<RoomWithSeats | undefined> {
  if (!id) return undefined
  try {
    return await getRoom(id)
  } catch {
    return undefined
  }
}

// The wizard opens with whatever the URL names (?child=&room=&date=), but only what the backend
// confirms: a child that is yours, a room that exists, a date on that room's weekday. The children,
// the balance and the named room are fetched here, so step 1 paints with data.
export default async function BookPage({ searchParams }: BookPageProps) {
  const raw = await searchParams
  const queryClient = makeQueryClient()

  const [, , room] = await Promise.all([
    queryClient.prefetchQuery({
      queryKey: childKeys.list(WIZARD_CHILD_PARAMS),
      queryFn: () => getChildrenPage(WIZARD_CHILD_PARAMS),
    }),
    queryClient.prefetchQuery({
      queryKey: guardianKeys.profile(),
      queryFn: getGuardianProfile,
    }),
    loadRoom(first(raw.room)),
  ])

  const children = queryClient.getQueryData<Paginated<Child>>(childKeys.list(WIZARD_CHILD_PARAMS))
  const childParam = first(raw.child)
  const dateParam = parseSessionDateParam(first(raw.date))

  const initial: BookingFormInput = {
    childId:
      children?.items.some((child) => child.id === childParam) && childParam ? childParam : '',
    roomId: room?.id ?? '',
    // The named date only counts if it falls on the room's weekday; otherwise the room's next
    // session is picked.
    sessionDate: room
      ? dateParam && weekdayOf(dateParam) === room.dayOfWeek
        ? dateParam
        : room.sessionDate
      : '',
  }

  // Steps 2 and 3 read the room (and its seats for the picked date) from the cache, so hand it over
  // instead of asking again. A date other than the room's next session needs its own lookup.
  if (room) {
    queryClient.setQueryData(roomKeys.detail(room.id), room)
    if (initial.sessionDate !== room.sessionDate) {
      await queryClient.prefetchQuery({
        queryKey: roomKeys.detail(room.id, initial.sessionDate),
        queryFn: () => getRoom(room.id, initial.sessionDate),
      })
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookingWizard initial={initial} />
    </HydrationBoundary>
  )
}
