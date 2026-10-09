import { DataTableSkeleton } from '@/components/shared/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { AUDIT_PAGE_SIZE } from '../audit.params'

// The loading shape of the audit log: the heading, the filter card and the table.
export function AuditListSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading the audit log</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
        <Skeleton className="h-16 w-full rounded-lg sm:max-w-xs" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <DataTableSkeleton columns={5} rows={AUDIT_PAGE_SIZE} />
    </div>
  )
}
