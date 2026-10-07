import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { MyProfileView } from '@/features/staff/components/my-profile-view'
import { staffKeys } from '@/features/staff/staff.keys'
import { getMyStaffProfile } from '@/features/staff/staff.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Profile' }

// The profile is fetched here, on the server, and handed to the client view through the query cache,
// so the page opens already filled in. After that the client owns it (saving, uploading).
export default async function StaffProfilePage() {
  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({ queryKey: staffKeys.me(), queryFn: getMyStaffProfile })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyProfileView />
    </HydrationBoundary>
  )
}
