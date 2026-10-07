import { Skeleton } from '@/components/ui/skeleton'

const KPI_IDS = ['a', 'b', 'c', 'd', 'e', 'f'] as const
const RANGE_IDS = ['7d', '14d', '30d'] as const

function PanelSkeleton({ className, chart = 'h-72' }: { className?: string; chart?: string }) {
  return (
    <div className={`flex flex-col gap-4 rounded-xl border bg-card p-4 ${className ?? ''}`}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className={`${chart} w-full rounded-lg`} />
    </div>
  )
}

// Same shape as the board: header, the period buttons, a strip of numbers, then chart panels.
export function StatsSkeleton() {
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

      <div aria-hidden="true" className="flex flex-col gap-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {KPI_IDS.map((id) => (
            <div key={id} className="rounded-2xl border bg-card p-4 sm:p-5">
              <Skeleton className="size-10 rounded-xl" />
              <div className="mt-4 flex flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-48 max-w-full" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <PanelSkeleton className="lg:col-span-2" />
          <PanelSkeleton />
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          <PanelSkeleton className="lg:col-span-3" />
          <PanelSkeleton className="lg:col-span-2" />
        </div>
      </div>
    </div>
  )
}
