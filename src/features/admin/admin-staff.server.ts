import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { AdminStaffListParams, StaffProfile } from '@/types'

export const getAdminStaffPage = (params: AdminStaffListParams) =>
  serverApi.getList<StaffProfile>('/admin/staff', params)

export const getAdminStaff = (id: string) => serverApi.get<StaffProfile>(`/admin/staff/${id}`)
