import { clientApi } from '@/lib/api/client'
import type {
  AssignedBooking,
  AvailabilitySlot,
  StaffProfile,
  StaffRatings,
  StaffTaskListParams,
  StaffTripListParams,
  Trip,
} from '@/types'
import {
  type StaffRatingsParams,
  toStaffRatingsPage,
  toTasksPage,
  toTripsPage,
} from './staff.params'

// One function per endpoint, for the browser (through the BFF). Server pages use staff.server.ts.
export const staffApi = {
  ratings: async (staffId: string, params: StaffRatingsParams, signal?: AbortSignal) =>
    toStaffRatingsPage(
      await clientApi.request<StaffRatings>(`/staff/${staffId}/ratings`, { query: params, signal }),
    ),
  me: (signal?: AbortSignal) => clientApi.get<StaffProfile>('/staff/me', undefined, signal),
  availability: (staffId: string, signal?: AbortSignal) =>
    clientApi.get<AvailabilitySlot[]>(`/staff/${staffId}/availability`, undefined, signal),
  // Confirmed bookings in the sitter's rooms that still need a check-in or a check-out.
  tasks: async (params: StaffTaskListParams, signal?: AbortSignal) =>
    toTasksPage(await clientApi.getList<AssignedBooking>('/staff/me/bookings', params, signal)),
  // The driver's trips, filtered by status.
  trips: async (params: StaffTripListParams, signal?: AbortSignal) =>
    toTripsPage(await clientApi.getList<Trip>('/staff/me/trips', params, signal)),
}
