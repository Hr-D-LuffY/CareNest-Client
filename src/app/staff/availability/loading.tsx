import { Skeleton } from '@/components/ui/skeleton'
import { DAYS_OF_WEEK } from '@/types'

// Same shape as the page: header, then the week card.
export default function StaffAvailabilityLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading your availability</span>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-44 md:h-9" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <Skeleton className="h-6 w-32" />
        {DAYS_OF_WEEK.map((day) => (
          <Skeleton key={day} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
