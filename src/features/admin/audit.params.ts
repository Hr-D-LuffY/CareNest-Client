import { DEFAULT_PAGE } from '@/lib/constants'
import type { AuditLogListParams } from '@/types'
import { AUDIT_ENTITIES } from './audit-entities'

// Audit events shown per page.
export const AUDIT_PAGE_SIZE = 15

// What the page shows, read from the URL (?entity=&page=).
export type AuditViewParams = {
  page: number
  // The record type ("Booking"), one of AUDIT_ENTITIES.
  entity?: string
}

// The view's params from the raw URL values. The backend filters `entity` by exact match on a free
// string, so only the record types it really writes are accepted; anything else (a hand-edited URL)
// falls back to "every record" instead of an empty list. Both the server page (prefetch) and the
// client list call this, so they build the same query key.
export function parseAuditViewParams(raw: {
  page?: string | null
  entity?: string | null
}): AuditViewParams {
  const page = Number(raw.page)
  const entity = AUDIT_ENTITIES.find((option) => option.value === raw.entity)?.value
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    ...(entity && { entity }),
  }
}

export function toAuditLogListParams({ page, entity }: AuditViewParams): AuditLogListParams {
  return { page, limit: AUDIT_PAGE_SIZE, ...(entity && { entity }) }
}

// The URL params that are filters, for "Clear filters".
export const AUDIT_FILTER_KEYS = ['entity'] as const
