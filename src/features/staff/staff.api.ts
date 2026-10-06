import { clientApi } from '@/lib/api/client'
import type { StaffRatings } from '@/types'
import { type StaffRatingsParams, toStaffRatingsPage } from './staff.params'

// One function per endpoint, for the browser (through the BFF). Server pages use staff.server.ts.
export const staffApi = {
  ratings: async (staffId: string, params: StaffRatingsParams, signal?: AbortSignal) =>
    toStaffRatingsPage(
      await clientApi.request<StaffRatings>(`/staff/${staffId}/ratings`, { query: params, signal }),
    ),
}
