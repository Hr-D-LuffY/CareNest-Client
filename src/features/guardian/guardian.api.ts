import { clientApi } from '@/lib/api/client'
import type { GuardianProfile, UpdateGuardianPayload } from '@/types'

// One function per endpoint, for the browser (through the BFF). Server pages use guardian.server.ts.
export const guardianApi = {
  profile: (signal?: AbortSignal) =>
    clientApi.get<GuardianProfile>('/guardian/me', undefined, signal),
  update: (payload: UpdateGuardianPayload) =>
    clientApi.patch<GuardianProfile>('/guardian/me', payload),
  uploadPhoto: (file: File, onProgress?: (percent: number) => void) =>
    clientApi.upload<GuardianProfile>({
      path: '/guardian/me/photo',
      field: 'photo',
      file,
      onProgress,
    }),
  // A soft delete: the account is closed and cannot sign in again.
  remove: () => clientApi.delete('/guardian/me'),
}
