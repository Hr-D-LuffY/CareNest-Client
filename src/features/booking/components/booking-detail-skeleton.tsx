import { Skeleton } from '@/components/ui/skeleton'

const ROW_IDS = ['a', 'b', 'c', 'd', 'e', 'f'] as const

function CardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-4 w-56 max-w-full" />
      {ROW_IDS.slice(0, rows).map((id) => (
        <Skeleton key={id} className="h-5 w-full" />
      ))}
    </div>
  )
}

// Same shape as the booking page: the title block, then the session card beside the ride and
// rating cards. Used by the page's loading.tsx and while the booking loads on the client.
export function BookingDetailSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading the booking</span>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-72 max-w-full md:h-9" />
        <div className="flex gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <CardSkeleton rows={6} />
        <div className="flex flex-col gap-6">
          <CardSkeleton rows={4} />
          <CardSkeleton rows={2} />
        </div>
      </div>
    </div>
  )
}
