import { DataTableSkeleton } from '@/components/shared/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { ADMIN_ROOMS_PAGE_SIZE } from '../admin-room.params'

// The loading shape of the rooms list: the heading, the filter card and the table.
export function RoomsListSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading care rooms</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-36 rounded-lg" />
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-16 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
      <DataTableSkeleton columns={6} rows={ADMIN_ROOMS_PAGE_SIZE} />
    </div>
  )
}
