import { DataTableSkeleton } from '@/components/shared/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { TRANSPORT_PAGE_SIZE } from '@/features/transport/transport-list.params'

const TAB_IDS = ['all', 'requested', 'on-the-way', 'completed', 'cancelled'] as const

// Same shape as the page: header with the action, the tabs, then the table.
export default function TransportLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40 md:h-9" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-40 rounded-lg" />
      </div>
      <div className="flex flex-wrap gap-2">
        {TAB_IDS.map((id) => (
          <Skeleton key={id} className="h-10 w-24 rounded-lg" />
        ))}
      </div>
      <DataTableSkeleton columns={7} rows={TRANSPORT_PAGE_SIZE} />
    </div>
  )
}
