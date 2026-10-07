import 'server-only'
import { cache } from 'react'
import { serverApi } from '@/lib/api/server'
import type {
  AssignedBooking,
  AvailabilitySlot,
  Earnings,
  StaffProfile,
  StaffRatings,
  StaffTaskListParams,
  StaffTripListParams,
  Trip,
} from '@/types'
import type { EarningsWindow } from './earnings.params'
import {
  type StaffRatingsParams,
  toStaffRatingsPage,
  toTasksPage,
  toTripsPage,
} from './staff.params'

export const getStaffRatings = async (staffId: string, params: StaffRatingsParams) =>
  toStaffRatingsPage(
    await serverApi.request<StaffRatings>(`/staff/${staffId}/ratings`, { query: params }),
  )

// The signed-in staff member's own profile. Its `id` is the staff id that rooms, ratings and
// availability use (it is not the user id). Cached for the request, so the layout and the page that
// both need it make one backend call.
export const getMyStaffProfile = cache(() => serverApi.get<StaffProfile>('/staff/me'))

export const getStaffAvailability = (staffId: string) =>
  serverApi.get<AvailabilitySlot[]>(`/staff/${staffId}/availability`)

export const getStaffTasksPage = async (params: StaffTaskListParams) =>
  toTasksPage(await serverApi.getList<AssignedBooking>('/staff/me/bookings', params))

export const getStaffTripsPage = async (params: StaffTripListParams) =>
  toTripsPage(await serverApi.getList<Trip>('/staff/me/trips', params))

export const getStaffEarnings = (window: EarningsWindow) =>
  serverApi.get<Earnings>('/staff/me/earnings', window)
