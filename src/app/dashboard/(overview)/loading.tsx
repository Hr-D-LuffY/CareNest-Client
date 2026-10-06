import { Skeleton } from '@/components/ui/skeleton'

// Same shape as the overview: the welcome banner, the four-number strip, the week row, then the
// activity and tips panels.
export default function GuardianOverviewLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <output className="sr-only">Loading your overview</output>

      <Skeleton className="h-64 w-full rounded-3xl sm:h-56" />

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
        {['wallet', 'children', 'sessions', 'rides'].map((id) => (
          <div key={id} className="flex items-center gap-3 bg-card p-4">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {['d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6'].map((id) => (
            <Skeleton key={id} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 lg:col-span-3">
          <Skeleton className="h-6 w-36" />
          {['one', 'two', 'three', 'four'].map((id) => (
            <div key={id} className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 lg:col-span-2">
          <Skeleton className="h-6 w-32" />
          {['one', 'two', 'three'].map((id) => (
            <div key={id} className="flex items-start gap-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
