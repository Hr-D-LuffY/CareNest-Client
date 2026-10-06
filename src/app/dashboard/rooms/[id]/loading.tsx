import { Skeleton } from '@/components/ui/skeleton'

const ROW_IDS = ['a', 'b', 'c', 'd', 'e', 'f'] as const

function CardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-soft">
      <Skeleton className="h-6 w-40" />
      {ROW_IDS.slice(0, rows).map((id) => (
        <Skeleton key={id} className="h-5 w-full" />
      ))}
    </div>
  )
}

// Same shape as the page: on the left the title block, the booking card and the reviews; on the
// right the staff card, the About card and the calculator.
export default function RoomDetailLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <span className="sr-only">Loading the care room</span>
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-72 max-w-full md:h-9" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-36" />
          </div>
        </div>
        <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-soft">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            {['a', 'b', 'c', 'd'].map((id) => (
              <Skeleton key={id} className="h-20 w-18 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-11 w-44 self-end rounded-lg" />
        </div>
        <CardSkeleton rows={4} />
      </div>
      <div className="flex flex-col gap-6">
        <CardSkeleton rows={5} />
        <CardSkeleton rows={4} />
        <CardSkeleton rows={3} />
      </div>
    </div>
  )
}
