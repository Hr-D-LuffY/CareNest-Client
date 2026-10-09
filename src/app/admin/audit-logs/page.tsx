import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { auditKeys } from '@/features/admin/audit.keys'
import { parseAuditViewParams, toAuditLogListParams } from '@/features/admin/audit.params'
import { getAuditLogsPage } from '@/features/admin/audit.server'
import { AuditListView } from '@/features/admin/components/audit-list-view'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Audit log' }

type AdminAuditPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// The audit log. The page in the URL (?entity=&page=) is fetched here, on the server, and handed to
// the client view through the query cache, so the first paint already has the events.
export default async function AdminAuditPage({ searchParams }: AdminAuditPageProps) {
  const raw = await searchParams
  const params = toAuditLogListParams(
    parseAuditViewParams({ page: first(raw.page), entity: first(raw.entity) }),
  )

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => getAuditLogsPage(params),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuditListView />
    </HydrationBoundary>
  )
}
