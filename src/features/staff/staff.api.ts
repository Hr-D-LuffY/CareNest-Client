import { clientApi } from '@/lib/api/client'
import type { AssignedBooking, AvailabilitySlot, StaffRatings, StaffTaskListParams } from '@/types'
import { type StaffRatingsParams, toStaffRatingsPage, toTasksPage } from './staff.params'

// One function per endpoint, for the browser (through the BFF). Server pages use staff.server.ts.
export const staffApi = {
  ratings: async (staffId: string, params: StaffRatingsParams, signal?: AbortSignal) =>
    toStaffRatingsPage(
      await clientApi.request<StaffRatings>(`/staff/${staffId}/ratings`, { query: params, signal }),
    ),
  availability: (staffId: string, signal?: AbortSignal) =>
    clientApi.get<AvailabilitySlot[]>(`/staff/${staffId}/availability`, undefined, signal),
  // Confirmed bookings in the sitter's rooms that still need a check-in or a check-out.
  tasks: async (params: StaffTaskListParams, signal?: AbortSignal) =>
    toTasksPage(await clientApi.getList<AssignedBooking>('/staff/me/bookings', params, signal)),
}
