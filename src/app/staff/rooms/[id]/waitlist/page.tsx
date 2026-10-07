import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { roomKeys } from '@/features/room/room.keys'
import { getRoom } from '@/features/room/room.server'
import { RoomWaitlistView } from '@/features/waitlist/components/room-waitlist-view'
import { waitlistKeys } from '@/features/waitlist/waitlist.keys'
import { parseRoomWaitlistView, toRoomWaitlistParams } from '@/features/waitlist/waitlist.params'
import { getRoomWaitlistPage } from '@/features/waitlist/waitlist.server'
import { ApiError } from '@/lib/api/errors'
import { getSession } from '@/lib/auth/session'
import { makeQueryClient } from '@/lib/query-client'
import { StaffType } from '@/types/enums'

export const metadata: Metadata = { title: 'Room waitlist' }

type RoomWaitlistPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// The ranked queue of one room a sitter runs. The backend answers 404 for a room that is not theirs
// (or does not exist), so that shows the area's "not found" page, never someone else's queue.
//
// The room and the queue for the session in the URL are fetched here, on the server, and handed to the
// client view through the query cache, so the first paint already has them.
export default async function StaffRoomWaitlistPage({
  params,
  searchParams,
}: RoomWaitlistPageProps) {
  const session = await getSession()
  if (session?.staffType === StaffType.DRIVER) redirect('/staff/trips')

  const { id } = await params
  const raw = await searchParams
  const waitlistParams = toRoomWaitlistParams(
    parseRoomWaitlistView({ page: first(raw.page), date: first(raw.date) }),
  )

  const queryClient = makeQueryClient()
  try {
    queryClient.setQueryData(
      waitlistKeys.roomList(id, waitlistParams),
      await getRoomWaitlistPage(id, waitlistParams),
    )
  } catch (error) {
    // Not this staff member's room (404), or not a room id at all (400).
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound()
    // Anything else (backend asleep, a timeout): the client view fetches and shows its own retry.
  }
  // The room's details are a nicety next to the queue, so a failure here is not fatal either.
  await queryClient.prefetchQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => getRoom(id),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoomWaitlistView roomId={id} backHref="/staff/rooms" backLabel="All waitlists" />
    </HydrationBoundary>
  )
}
