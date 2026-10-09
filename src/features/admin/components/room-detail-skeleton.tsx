import { Skeleton } from '@/components/ui/skeleton'

// The loading shape of the admin's room page: the brand header, the waitlist on the left and the
// side cards on the right. Also used by the page's loading.tsx.
export function RoomDetailSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading care room</span>
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-10 w-96 max-w-full" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-10 w-72 max-w-full" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
