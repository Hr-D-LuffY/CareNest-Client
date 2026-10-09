import { clientApi } from '@/lib/api/client'
import type { AdminUser, AdminUserListParams } from '@/types'

// One function per endpoint, for the browser (through the BFF). Server pages use admin-user.server.ts
// (that is where a single user's profile is read). Admin-only.
export const adminUserApi = {
  list: (params: AdminUserListParams, signal?: AbortSignal) =>
    clientApi.getList<AdminUser>('/admin/users', params, signal),
}
