'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { AuditLogListParams } from '@/types'
import { auditApi } from './audit.api'
import { auditKeys } from './audit.keys'

export function useAuditLogsQuery(params: AuditLogListParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: ({ signal }) => auditApi.list(params, signal),
    // Keep showing the old page while the next one loads, so paging and filtering do not flash a
    // skeleton.
    placeholderData: keepPreviousData,
  })
}
