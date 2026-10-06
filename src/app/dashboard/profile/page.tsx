import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { ProfileView } from '@/features/guardian/components/profile-view'
import { guardianKeys } from '@/features/guardian/guardian.keys'
import { getGuardianProfile } from '@/features/guardian/guardian.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Profile' }

// The profile is fetched here, on the server, and handed to the client form through the query cache,
// so the form opens already filled in. After that the client owns it (saving, photo upload).
export default async function ProfilePage() {
  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: guardianKeys.profile(),
    queryFn: getGuardianProfile,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileView />
    </HydrationBoundary>
  )
}
