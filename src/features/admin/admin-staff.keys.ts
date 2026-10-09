import type { AdminStaffListParams } from '@/types'

// Query keys for the admin's staff pages. Kept out of admin-staff.queries.ts ("use client") so server
// pages can use the same keys. Creating, editing, verifying or removing staff invalidates
// adminStaffKeys.all.
export const adminStaffKeys = {
  all: ['admin-staff'] as const,
  lists: () => [...adminStaffKeys.all, 'list'] as const,
  list: (params: AdminStaffListParams) => [...adminStaffKeys.lists(), params] as const,
  // Verified sitters (SITTER and BOTH), who can be given a room.
  assignable: () => [...adminStaffKeys.all, 'assignable'] as const,
  detail: (id: string) => [...adminStaffKeys.all, 'detail', id] as const,
}
