import { Skeleton } from '@/components/ui/skeleton'

// The loading shape of a user's profile page: the back link, the identity card on the left and the
// detail cards on the right.
export function UserProfileSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading user</span>
      <Skeleton className="h-6 w-24" />
      <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Skeleton className="h-80 w-full rounded-xl" />
        <div className="flex flex-col gap-6">
          <Skeleton className="h-60 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
