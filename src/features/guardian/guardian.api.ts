import { clientApi } from '@/lib/api/client'
import type { GuardianProfile } from '@/types'

// One function per endpoint, for the browser (through the BFF). Server pages use guardian.server.ts.
export const guardianApi = {
  profile: (signal?: AbortSignal) =>
    clientApi.get<GuardianProfile>('/guardian/me', undefined, signal),
}
