import { Skeleton } from '@/components/ui/skeleton'

const FIGURE_IDS = ['bookings', 'cancellations', 'revenue'] as const
const ANOMALY_IDS = ['first', 'second'] as const

// The card while the briefing is written. An AI call takes a few seconds, so the screen reader is told
// what is happening instead of hearing nothing.
export function InsightsSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <output className="sr-only">
        Writing today's briefing. This can take up to ten seconds.
      </output>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {FIGURE_IDS.map((id) => (
            <Skeleton key={id} className="h-24 rounded-xl" />
          ))}
        </div>
        {ANOMALY_IDS.map((id) => (
          <Skeleton key={id} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
