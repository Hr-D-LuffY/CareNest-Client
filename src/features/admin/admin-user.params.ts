import { DEFAULT_PAGE } from '@/lib/constants'
import { type AdminUserListParams, Role } from '@/types'

// Users shown per page on the admin's user list.
export const ADMIN_USERS_PAGE_SIZE = 10

// What the page shows, read from the URL (?role=&page=).
export type AdminUserViewParams = {
  page: number
  role?: Role
}

const ROLES: readonly Role[] = Object.values(Role)

// The view's params from the raw URL values. A hand-edited URL (?role=NOPE, ?page=abc) falls back to
// "no filter, page 1" instead of reaching the backend as a 400. Both the server page (prefetch) and
// the client list call this, so they build the same query key.
export function parseAdminUserViewParams(raw: {
  page?: string | null
  role?: string | null
}): AdminUserViewParams {
  const page = Number(raw.page)
  const role = ROLES.find((option) => option === raw.role)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    ...(role && { role }),
  }
}

export function toAdminUserListParams({ page, role }: AdminUserViewParams): AdminUserListParams {
  return { page, limit: ADMIN_USERS_PAGE_SIZE, ...(role && { role }) }
}

// The URL params that are filters, for "Clear filters".
export const ADMIN_USER_FILTER_KEYS = ['role'] as const
