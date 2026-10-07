import { Skeleton } from '@/components/ui/skeleton'

const CARD_IDS = ['a', 'b', 'c'] as const

// The room cards while they load.
export function WaitlistsBodySkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {CARD_IDS.map((id) => (
        <div key={id} className="flex flex-col rounded-2xl border bg-card shadow-soft">
          <div className="flex flex-col gap-4 p-5">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex items-center justify-between border-t px-5 py-3">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Same shape as the page: the header, then the cards.
export function WaitlistsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40 md:h-9" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <WaitlistsBodySkeleton />
    </div>
  )
}
