import { clientApi } from '@/lib/api/client'
import type { AuditLog, AuditLogListParams } from '@/types'

export const auditApi = {
  list: (params: AuditLogListParams, signal?: AbortSignal) =>
    clientApi.getList<AuditLog>('/admin/audit-logs', params, signal),
}
