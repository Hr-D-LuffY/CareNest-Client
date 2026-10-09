import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { AuditLog, AuditLogListParams } from '@/types'

export const getAuditLogsPage = (params: AuditLogListParams) =>
  serverApi.getList<AuditLog>('/admin/audit-logs', params)
