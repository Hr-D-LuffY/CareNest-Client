import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AvailabilityView } from '@/features/staff/components/availability-view'
import { staffKeys } from '@/features/staff/staff.keys'
import { getMyStaffProfile, getStaffAvailability } from '@/features/staff/staff.server'
import { getSession } from '@/lib/auth/session'
import { makeQueryClient } from '@/lib/query-client'
import { StaffType } from '@/types/enums'

export const metadata: Metadata = { title: 'Availability' }

// The sitter's availability. The backend only uses it to check that a care room fits inside a
// sitter's hours, and rides never read it, so a driver (who has no use for it) goes to their trips.
//
// The profile and the weekly availability are fetched here, on the server, and handed to the client
// view through the query cache, so the page opens already filled in. After that the client owns it
// (adding, editing and removing times).
export default async function StaffAvailabilityPage() {
  const session = await getSession()
  if (session?.staffType === StaffType.DRIVER) redirect('/staff/trips')

  const queryClient = makeQueryClient()

  // Availability is read by staff id, which is not the user id, so the profile comes first. A failure
  // is not fatal: whatever could not be prefetched is fetched by the client view, which shows its
  // own error state.
  try {
    const profile = await getMyStaffProfile()
    queryClient.setQueryData(staffKeys.me(), profile)
    await queryClient.prefetchQuery({
      queryKey: staffKeys.availability(profile.id),
      queryFn: () => getStaffAvailability(profile.id),
    })
  } catch {
    // The client view shows a retry.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AvailabilityView />
    </HydrationBoundary>
  )
}
