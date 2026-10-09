import type { AuditLogListParams } from '@/types'

// Query keys for the audit log. Kept out of audit.queries.ts ("use client") so the server page can
// use the same keys when it prefetches.
export const auditKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (params: AuditLogListParams) => [...auditKeys.lists(), params] as const,
}
