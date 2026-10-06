import { Skeleton } from '@/components/ui/skeleton'

const CARD_IDS = ['a', 'b', 'c', 'd', 'e', 'f'] as const

// The loading shape of the room list (cards in a grid). Also used by the page's loading.tsx.
export function RoomListSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading care rooms</span>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARD_IDS.map((id) => (
          <div key={id} className="flex flex-col rounded-2xl border bg-card shadow-soft">
            <div className="flex flex-col gap-4 p-5">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <Skeleton className="h-5 w-56 max-w-full" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-7 w-48 max-w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t px-5 py-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
