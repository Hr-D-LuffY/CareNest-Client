import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { AdminUser, AdminUserDetail, AdminUserListParams } from '@/types'

export const getAdminUsersPage = (params: AdminUserListParams) =>
  serverApi.getList<AdminUser>('/admin/users', params)

export const getAdminUser = (id: string) => serverApi.get<AdminUserDetail>(`/admin/users/${id}`)
