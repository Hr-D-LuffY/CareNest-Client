import { clientApi } from '@/lib/api/client'
import type {
  AssignedBooking,
  AvailabilitySlot,
  Earnings,
  SlotPayload,
  StaffProfile,
  StaffRatings,
  StaffTaskListParams,
  StaffTripListParams,
  Trip,
  UpdateSlotPayload,
  UpdateStaffProfilePayload,
} from '@/types'
import type { EarningsWindow } from './earnings.params'
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
  // Name, bio and experience only: type, rates and verification are admin-managed.
  updateMe: (payload: UpdateStaffProfilePayload) =>
    clientApi.patch<StaffProfile>('/staff/me', payload),
  // The profile photo (JPEG, PNG or WEBP, up to 5 MB). It is shown in the top bar and on the profile.
  uploadPhoto: (file: File, onProgress?: (percent: number) => void) =>
    clientApi.upload<StaffProfile>({
      path: '/staff/me/photo',
      field: 'photo',
      file,
      onProgress,
    }),
  // An image (JPEG, PNG or WEBP, up to 5 MB) the admin reviews when deciding on verification.
  uploadVerificationDocument: (file: File, onProgress?: (percent: number) => void) =>
    clientApi.upload<StaffProfile>({
      path: '/staff/me/verification-document',
      field: 'document',
      file,
      onProgress,
    }),
  createSlot: (payload: SlotPayload) =>
    clientApi.post<AvailabilitySlot>('/staff/availability', payload),
  updateSlot: (id: string, payload: UpdateSlotPayload) =>
    clientApi.patch<AvailabilitySlot>(`/staff/availability/${id}`, payload),
  deleteSlot: (id: string) => clientApi.delete(`/staff/availability/${id}`),
  availability: (staffId: string, signal?: AbortSignal) =>
    clientApi.get<AvailabilitySlot[]>(`/staff/${staffId}/availability`, undefined, signal),
  // Confirmed bookings in the sitter's rooms that still need a check-in or a check-out.
  tasks: async (params: StaffTaskListParams, signal?: AbortSignal) =>
    toTasksPage(await clientApi.getList<AssignedBooking>('/staff/me/bookings', params, signal)),
  // The care fees and trip fares from work finished inside the window.
  earnings: (window: EarningsWindow, signal?: AbortSignal) =>
    clientApi.get<Earnings>('/staff/me/earnings', window, signal),
  // The driver's trips, filtered by status.
  trips: async (params: StaffTripListParams, signal?: AbortSignal) =>
    toTripsPage(await clientApi.getList<Trip>('/staff/me/trips', params, signal)),
}
