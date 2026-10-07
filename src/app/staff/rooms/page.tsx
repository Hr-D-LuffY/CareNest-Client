import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { roomKeys } from '@/features/room/room.keys'
import { getAllRooms } from '@/features/room/room.server'
import { WaitlistsView } from '@/features/staff/components/waitlists-view'
import { staffKeys } from '@/features/staff/staff.keys'
import { getMyStaffProfile } from '@/features/staff/staff.server'
import { getSession } from '@/lib/auth/session'
import { makeQueryClient } from '@/lib/query-client'
import { StaffType } from '@/types/enums'

export const metadata: Metadata = { title: 'Waitlists' }

// The waitlist of each care room a sitter runs, one card per room. Drivers run no rooms (the backend
// only assigns them to sitters), so a driver (who has nothing to see here) goes to their trips.
//
// The profile and the room list are fetched here, on the server, and handed to the client view
// through the query cache, so the page opens already filled in.
export default async function StaffRoomsPage() {
  const session = await getSession()
  if (session?.staffType === StaffType.DRIVER) redirect('/staff/trips')

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: staffKeys.me(), queryFn: getMyStaffProfile }),
    queryClient.prefetchQuery({ queryKey: roomKeys.catalogue(), queryFn: getAllRooms }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WaitlistsView />
    </HydrationBoundary>
  )
}
