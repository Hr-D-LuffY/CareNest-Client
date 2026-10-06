import { DataTableSkeleton } from '@/components/shared/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { BOOKINGS_PAGE_SIZE } from '@/features/booking/booking-list.params'

const TAB_IDS = ['all', 'confirmed', 'waitlist', 'completed', 'cancelled'] as const

// Same shape as the page: header with the action, the tabs, then the table.
export default function BookingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40 md:h-9" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-36 rounded-lg" />
      </div>
      <div className="flex flex-wrap gap-2">
        {TAB_IDS.map((id) => (
          <Skeleton key={id} className="h-10 w-24 rounded-lg" />
        ))}
      </div>
      <DataTableSkeleton columns={6} rows={BOOKINGS_PAGE_SIZE} />
    </div>
  )
}
