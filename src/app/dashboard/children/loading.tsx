import { Skeleton } from '@/components/ui/skeleton'
import { ChildListSkeleton } from '@/features/child/components/child-skeleton'

// Same shape as the page: header, tier filter, then the cards.
export default function ChildrenLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40 md:h-9" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <Skeleton className="h-11 w-36 rounded-lg" />
      </div>
      <div className="flex gap-2">
        {['all', 'daily', 'weekly', 'monthly'].map((id) => (
          <Skeleton key={id} className="h-10 w-20 rounded-lg" />
        ))}
      </div>
      <ChildListSkeleton />
    </div>
  )
}
