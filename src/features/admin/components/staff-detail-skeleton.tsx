import { Skeleton } from '@/components/ui/skeleton'

// The loading shape of the staff detail body: the profile and verification cards on the left, the
// details, hours and reviews on the right.
export function StaffDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]"
    >
      <span className="sr-only">Loading staff member</span>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  )
}
