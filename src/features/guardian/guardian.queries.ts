'use client'

import { useQuery } from '@tanstack/react-query'
import { guardianApi } from './guardian.api'
import { guardianKeys } from './guardian.keys'

// The signed-in guardian's profile. The wallet balance comes from here, so anything that moves
// money (a top-up, a booking, a cancellation) invalidates guardianKeys.all to refresh it.
export function useGuardianProfile() {
  return useQuery({
    queryKey: guardianKeys.profile(),
    queryFn: ({ signal }) => guardianApi.profile(signal),
  })
}
