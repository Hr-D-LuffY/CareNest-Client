import { Skeleton } from '@/components/ui/skeleton'

const CARD_IDS = ['a', 'b', 'c'] as const
const TAB_IDS = ['upcoming', 'completed', 'cancelled'] as const

// The list part of the page while it loads: trip cards in a grid.
export function TripListSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {CARD_IDS.map((id) => (
        <div key={id} className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// Same shape as the page: header, the tabs, then the list.
export function TripsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32 md:h-9" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="flex flex-wrap gap-2">
        {TAB_IDS.map((id) => (
          <Skeleton key={id} className="h-10 w-28 rounded-lg" />
        ))}
      </div>
      <TripListSkeleton />
    </div>
  )
}
