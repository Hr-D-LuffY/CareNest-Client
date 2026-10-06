import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { AvailabilitySlot, StaffRatings } from '@/types'
import { type StaffRatingsParams, toStaffRatingsPage } from './staff.params'

export const getStaffRatings = async (staffId: string, params: StaffRatingsParams) =>
  toStaffRatingsPage(
    await serverApi.request<StaffRatings>(`/staff/${staffId}/ratings`, { query: params }),
  )

export const getStaffAvailability = (staffId: string) =>
  serverApi.get<AvailabilitySlot[]>(`/staff/${staffId}/availability`)
