'use client'

import { Reveal } from '@/components/motion/reveal'
import { ListErrorState } from '@/components/shared/list-error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useStaffProfileQuery } from '../staff.queries'
import { AvailabilityCard } from './availability-card'

// The staff member's availability page: the days and hours they work, which also decide the Free and
// Off days on the Tasks calendar. Availability is read by staff id, which comes from the profile. The
// server page has already prefetched both, so this normally renders with data; if that failed, it
// shows a retry instead of an empty week.
export function AvailabilityView() {
  const { data, isPending, isError, refetch } = useStaffProfileQuery()

  function renderBody() {
    if (isPending) return <Skeleton aria-hidden="true" className="h-96 w-full rounded-xl" />
    if (isError || !data) return <ListErrorState onRetry={() => refetch()} />
    return <AvailabilityCard staffId={data.id} />
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-balance md:text-3xl">Availability</h1>
          <p className="text-muted-foreground">
            The days and hours you work. Your Tasks calendar shades these days, so you can see at a
            glance who is booked on them.
          </p>
        </header>
      </Reveal>
      {renderBody()}
    </div>
  )
}
