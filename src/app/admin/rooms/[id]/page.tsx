import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RoomDetailView } from '@/features/admin/components/room-detail-view'
import { bookingKeys } from '@/features/booking/booking.keys'
import { getRoomBookingsPage } from '@/features/booking/booking.server'
import { parseRoomRosterView, toRoomRosterParams } from '@/features/booking/room-roster.params'
import { roomKeys } from '@/features/room/room.keys'
import { getRoom } from '@/features/room/room.server'
import { waitlistKeys } from '@/features/waitlist/waitlist.keys'
import { parseRoomWaitlistView, toRoomWaitlistParams } from '@/features/waitlist/waitlist.params'
import { getRoomWaitlistPage } from '@/features/waitlist/waitlist.server'
import { ApiError } from '@/lib/api/errors'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Care room' }

type AdminRoomPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// A room that does not exist, or an id that is not even a UUID (the backend answers 400), is a 404
// page. Any other failure goes to the error boundary.
async function loadRoom(id: string) {
  try {
    return await getRoom(id)
  } catch (error) {
    if (error instanceof ApiError && (error.isNotFound || error.status === 400)) notFound()
    throw error
  }
}

// One room for the admin. The room and the queue for the session and page in the URL (?date=&page=)
// are fetched here, on the server, and handed to the client view through the query cache.
export default async function AdminRoomPage({ params, searchParams }: AdminRoomPageProps) {
  const [{ id }, raw] = await Promise.all([params, searchParams])
  const room = await loadRoom(id)

  const waitlistParams = toRoomWaitlistParams(
    parseRoomWaitlistView({ page: first(raw.page), date: first(raw.date) }),
  )

  const rosterParams = toRoomRosterParams(
    parseRoomRosterView(
      { page: first(raw.rpage), date: first(raw.rdate), status: first(raw.rstatus) },
      room,
    ),
  )

  const queryClient = makeQueryClient()
  queryClient.setQueryData(roomKeys.detail(id), room)
  // The booking list and the queue are not essential: a failure in either is swallowed and its panel
  // fetches (and shows its own error state with a retry) instead.
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: bookingKeys.roomRoster(id, rosterParams),
      queryFn: () => getRoomBookingsPage(id, rosterParams),
    }),
    queryClient.prefetchQuery({
      queryKey: waitlistKeys.roomList(id, waitlistParams),
      queryFn: () => getRoomWaitlistPage(id, waitlistParams),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoomDetailView id={id} />
    </HydrationBoundary>
  )
}
