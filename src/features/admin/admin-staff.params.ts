import { DEFAULT_PAGE } from '@/lib/constants'
import { type AdminStaffListParams, StaffType, VerificationStatus } from '@/types'

// Staff shown per page on the admin's staff list.
export const ADMIN_STAFF_PAGE_SIZE = 10

// Longest search text kept in the URL.
const MAX_SEARCH_LENGTH = 100

// What the page shows, read from the URL (?q=&type=&status=&page=).
export type AdminStaffViewParams = {
  page: number
  q?: string
  type?: StaffType
  status?: VerificationStatus
}

const STAFF_TYPES: readonly StaffType[] = Object.values(StaffType)
const STATUSES: readonly VerificationStatus[] = Object.values(VerificationStatus)

// The view's params from the raw URL values. A hand-edited URL (?type=NOPE, ?page=abc) falls back to
// "no filter, page 1" instead of reaching the backend as a 400. Both the server page (prefetch) and
// the client list call this, so they build the same query key.
export function parseAdminStaffViewParams(raw: {
  page?: string | null
  q?: string | null
  type?: string | null
  status?: string | null
}): AdminStaffViewParams {
  const page = Number(raw.page)
  const q = raw.q?.trim().slice(0, MAX_SEARCH_LENGTH)
  const type = STAFF_TYPES.find((option) => option === raw.type)
  const status = STATUSES.find((option) => option === raw.status)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    ...(q && { q }),
    ...(type && { type }),
    ...(status && { status }),
  }
}

// The backend's query for a view: filtering, searching and paging are all done there.
export function toAdminStaffListParams({
  page,
  q,
  type,
  status,
}: AdminStaffViewParams): AdminStaffListParams {
  return {
    page,
    limit: ADMIN_STAFF_PAGE_SIZE,
    ...(q && { search: q }),
    ...(type && { staffType: type }),
    ...(status && { verificationStatus: status }),
  }
}

// The URL params that are filters, for "Clear filters".
export const ADMIN_STAFF_FILTER_KEYS = ['q', 'type', 'status'] as const

// True when any filter (not the page) is applied.
export function hasAdminStaffFilters({ q, type, status }: AdminStaffViewParams): boolean {
  return Boolean(q || type || status)
}
