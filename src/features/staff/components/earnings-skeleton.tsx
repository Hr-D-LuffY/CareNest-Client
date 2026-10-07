import { Skeleton } from '@/components/ui/skeleton'

const RANGE_IDS = ['7d', '8w', '6m'] as const
const ROW_IDS = ['a', 'b', 'c', 'd', 'e'] as const

// The data part of the page while it loads: the hero card (total and chart) and the list of periods.
export function EarningsBodySkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="flex flex-col gap-6 rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-11 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
        <Skeleton className="h-5 w-32" />
        {ROW_IDS.map((id) => (
          <div key={id} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Same shape as the page: header, the range buttons, then the hero card and the list.
export function EarningsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40 md:h-9" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="flex gap-2">
        {RANGE_IDS.map((id) => (
          <Skeleton key={id} className="h-10 w-24 rounded-lg" />
        ))}
      </div>
      <EarningsBodySkeleton />
    </div>
  )
}
