'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api/client'
import type { UpdateGuardianPayload } from '@/types'
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

// The profile form shows its own errors (field errors under the field, a message above the button),
// so the global toast is switched off. The caller puts the saved profile into the cache.

export function useUpdateGuardian() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateGuardianPayload) => guardianApi.update(payload),
    meta: { skipGlobalError: true },
    onSuccess: (profile) => queryClient.setQueryData(guardianKeys.profile(), profile),
  })
}

export function useUploadGuardianPhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (percent: number) => void }) =>
      guardianApi.uploadPhoto(file, onProgress),
    meta: { skipGlobalError: true },
    onSuccess: (profile) => queryClient.setQueryData(guardianKeys.profile(), profile),
  })
}

// Closes the account, then signs out. A full page load to /login drops the query cache and every bit
// of state, like a normal logout. A failure gets the global toast and the user stays signed in.
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      await guardianApi.remove()
      try {
        await authApi.post<null>('/logout')
      } catch {
        // The account is already closed, so its tokens no longer work. The cookies are cleared by
        // the next request that fails, and the page below sends the user to /login anyway.
      }
    },
    onSuccess: () => window.location.assign('/login'),
  })
}
