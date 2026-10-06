import { CalendarCheck, CircleCheck, Hourglass, Plus } from 'lucide-react'
import Link from 'next/link'
import { OutcomeView } from '@/components/shared/outcome-view'
import { Button, buttonVariants } from '@/components/ui/button'
import { formatBDT, formatSessionDate, formatTimeRange } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CreateBookingResult } from '@/types'
import { formatPriorityScore } from '../waitlist-score'
import { PriorityScoreExplainer } from './priority-score-explainer'

type BookingResultProps = {
  result: CreateBookingResult
  onBookAnother: () => void
}

// What the backend decided: a confirmed seat (201), or a spot on the waitlist (202). A waitlist is
// not an error, so it gets its own screen with the priority score and what happens next.
export function BookingResult({ result, onBookAnother }: BookingResultProps) {
  const actions = (
    <>
      <Link
        href="/dashboard/bookings"
        className={cn(buttonVariants(), 'h-11 px-5 text-sm font-semibold')}
      >
        <CalendarCheck aria-hidden="true" />
        View my bookings
      </Link>
      <Button type="button" variant="outline" className="h-11 px-5 text-sm" onClick={onBookAnother}>
        <Plus aria-hidden="true" />
        Book another seat
      </Button>
    </>
  )

  if (result.outcome === 'confirmed') {
    const { booking } = result
    return (
      <OutcomeView
        icon={CircleCheck}
        tone="success"
        title="Seat confirmed"
        description={`${booking.child.name} has a seat. You are not charged yet: the final fee is taken from your wallet at check-out, for the time actually used.`}
        details={[
          { label: 'Child', value: booking.child.name },
          { label: 'Room', value: booking.room.name },
          { label: 'Date', value: formatSessionDate(booking.sessionDate) },
          { label: 'Time', value: formatTimeRange(booking.room.startTime, booking.room.endTime) },
          { label: 'Estimated fee', value: formatBDT(booking.estimatedFee) },
        ]}
      >
        {actions}
      </OutcomeView>
    )
  }

  const { entry } = result
  return (
    <OutcomeView
      icon={Hourglass}
      tone="warning"
      title="You are on the waitlist"
      description={`${entry.room.name} is full on that date, so ${entry.child.name} joined the queue instead. If a seat opens, the top-ranked child is booked automatically.`}
      details={[
        { label: 'Child', value: entry.child.name },
        { label: 'Room', value: entry.room.name },
        { label: 'Date', value: formatSessionDate(entry.sessionDate) },
        { label: 'Priority score', value: formatPriorityScore(entry.priorityScore) },
      ]}
      body={<PriorityScoreExplainer />}
    >
      {actions}
    </OutcomeView>
  )
}
