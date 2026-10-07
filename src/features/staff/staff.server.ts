import 'server-only'
import { serverApi } from '@/lib/api/server'
import type {
  AssignedBooking,
  AvailabilitySlot,
  StaffProfile,
  StaffRatings,
  StaffTaskListParams,
} from '@/types'
import { type StaffRatingsParams, toStaffRatingsPage, toTasksPage } from './staff.params'

export const getStaffRatings = async (staffId: string, params: StaffRatingsParams) =>
  toStaffRatingsPage(
    await serverApi.request<StaffRatings>(`/staff/${staffId}/ratings`, { query: params }),
  )

// The signed-in staff member's own profile. Its `id` is the staff id that rooms, ratings and
// availability use (it is not the user id).
export const getMyStaffProfile = () => serverApi.get<StaffProfile>('/staff/me')

export const getStaffAvailability = (staffId: string) =>
  serverApi.get<AvailabilitySlot[]>(`/staff/${staffId}/availability`)

export const getStaffTasksPage = async (params: StaffTaskListParams) =>
  toTasksPage(await serverApi.getList<AssignedBooking>('/staff/me/bookings', params))
