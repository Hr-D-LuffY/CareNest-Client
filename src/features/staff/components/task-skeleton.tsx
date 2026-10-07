import { Skeleton } from '@/components/ui/skeleton'

const TILE_IDS = Array.from({ length: 14 }, (_, index) => `tile-${index}`)
const ROW_IDS = ['a', 'b', 'c'] as const

// The board while it loads: the two-week calendar, then the roll call beside the In care panel.
export function TaskBoardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <div className="rounded-2xl border bg-card p-4 shadow-soft">
        <div className="flex items-center justify-between pb-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {TILE_IDS.map((id) => (
            <Skeleton key={id} className="h-24 rounded-xl sm:h-28" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex flex-col gap-3 lg:col-start-2 lg:row-start-1">
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft lg:col-start-1 lg:row-start-1">
          <div className="border-b bg-muted/40 px-5 py-3">
            <Skeleton className="h-6 w-40" />
          </div>
          {ROW_IDS.map((id) => (
            <div key={id} className="flex items-center gap-3 border-b px-5 py-4 last:border-b-0">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-11 w-36 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Same shape as the page: header, then the board.
export function TasksSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40 md:h-9" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <TaskBoardSkeleton />
    </div>
  )
}
