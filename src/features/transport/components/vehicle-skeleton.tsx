import { Skeleton } from '@/components/ui/skeleton'

const CARD_IDS = ['a', 'b', 'c'] as const

// The vehicle cards while they load.
export function VehicleListSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {CARD_IDS.map((id) => (
        <div key={id} className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-xl" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// Same shape as the page: header with the action, then the cards.
export function VehiclesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40 md:h-9" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-40 rounded-lg" />
      </div>
      <VehicleListSkeleton />
    </div>
  )
}
