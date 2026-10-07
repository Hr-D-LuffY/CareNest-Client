import { DataTableSkeleton } from '@/components/shared/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { ROOM_WAITLIST_PAGE_SIZE } from '../waitlist.params'

const CHIP_IDS = ['all', 'a', 'b', 'c'] as const

// Same shape as the page: the room banner, the session buttons, then the table.
export function RoomWaitlistSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div aria-hidden="true" className="flex flex-col gap-5 rounded-2xl bg-muted p-5 sm:p-6">
        <Skeleton className="h-5 w-24" />
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <Skeleton className="h-[4.5rem] w-44 rounded-xl" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {CHIP_IDS.map((id) => (
          <Skeleton key={id} className="h-10 w-28 rounded-lg" />
        ))}
      </div>
      <DataTableSkeleton columns={5} rows={ROOM_WAITLIST_PAGE_SIZE} />
    </div>
  )
}
