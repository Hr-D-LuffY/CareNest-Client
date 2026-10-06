import { Skeleton } from '@/components/ui/skeleton'
import { RoomListSkeleton } from '@/features/room/components/room-skeleton'

// Same shape as the page: header, then the filters and cards with the fare box beside them.
export default function RoomsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40 md:h-9" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-soft sm:p-5">
            <Skeleton className="h-11 w-full rounded-xl" />
            <div className="flex gap-2">
              {['all', 'daily', 'weekly', 'monthly'].map((id) => (
                <Skeleton key={id} className="h-10 w-20 rounded-lg" />
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {['status', 'day', 'date', 'sort'].map((id) => (
                <Skeleton key={id} className="h-[3.75rem] rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
          <RoomListSkeleton />
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-soft">
          <Skeleton className="h-10 w-56 max-w-full" />
          {['a', 'b', 'c', 'd'].map((id) => (
            <Skeleton key={id} className="h-14 w-full rounded-xl" />
          ))}
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  )
}
