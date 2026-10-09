import { DataTableSkeleton } from '@/components/shared/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { ADMIN_USERS_PAGE_SIZE } from '../admin-user.params'

// The loading shape of the user list: the heading, the filter card and the table.
export function UsersListSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading users</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
        <Skeleton className="h-16 w-full rounded-lg sm:max-w-xs" />
        <Skeleton className="h-5 w-24" />
      </div>
      <DataTableSkeleton columns={4} rows={ADMIN_USERS_PAGE_SIZE} />
    </div>
  )
}
