import type { AdminUserListParams } from '@/types'

// Query keys for the admin's user list. Kept out of admin-user.queries.ts ("use client") so server
// pages can use the same keys.
export const adminUserKeys = {
  all: ['admin-users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (params: AdminUserListParams) => [...adminUserKeys.lists(), params] as const,
}
