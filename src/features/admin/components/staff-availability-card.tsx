'use client'

import { CalendarClock } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatSlot, groupSlotsByDay } from '@/features/staff/availability-model'
import { useStaffAvailabilityQuery } from '@/features/staff/staff.queries'
import { DAY_LABEL } from '@/lib/constants'

// The days and hours a sitter works, to read. The sitter sets them on their own Availability page,
// and an admin can only assign a room inside these hours. The server page has already loaded them.
export function StaffAvailabilityCard({ staffId }: { staffId: string }) {
  const { data, isPending, isError, refetch } = useStaffAvailabilityQuery(staffId)

  function renderBody() {
    if (isPending) {
      return (
        <div aria-busy="true" aria-live="polite" className="flex flex-col gap-3">
          <span className="sr-only">Loading availability</span>
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      )
    }
    if (isError || !data) return <ListErrorState onRetry={() => refetch()} />

    const days = groupSlotsByDay(data).filter((entry) => entry.slots.length > 0)
    if (days.length === 0) {
      return (
        <EmptyState
          bare
          icon={CalendarClock}
          title="No times set yet"
          description="This sitter has not added the days and hours they work, so no room can be assigned to them yet."
        />
      )
    }

    return (
      <dl className="divide-y">
        {days.map(({ day, slots }) => (
          <div
            key={day}
            className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-6"
          >
            <dt className="w-28 shrink-0 text-sm font-medium">{DAY_LABEL[day]}</dt>
            <dd className="text-sm text-muted-foreground tabular-nums">
              {slots.map(formatSlot).join(', ')}
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Availability</CardTitle>
        <CardDescription>The days and hours this sitter works each week.</CardDescription>
      </CardHeader>
      <CardContent>{renderBody()}</CardContent>
    </Card>
  )
}
