import { Skeleton } from '@/components/ui/skeleton'

const CARD_IDS = ['a', 'b', 'c', 'd', 'e', 'f'] as const

// The loading shape of the children list (cards in a grid). Also the page's loading.tsx.
export function ChildListSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your children</span>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARD_IDS.map((id) => (
          <div key={id} className="flex flex-col rounded-2xl border bg-card shadow-soft">
            <div className="flex items-start gap-4 p-5">
              <Skeleton className="size-24 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t px-5 py-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-36" />
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <Skeleton className="h-10 w-20 rounded-lg" />
              <Skeleton className="size-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
