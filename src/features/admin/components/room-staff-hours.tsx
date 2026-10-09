'use client'

import { CalendarClock } from 'lucide-react'
import { formatSlot, groupSlotsByDay } from '@/features/staff/availability-model'
import { useStaffAvailabilityQuery } from '@/features/staff/staff.queries'
import { DAY_LABEL } from '@/lib/constants'
import type { DayOfWeek } from '@/types'

type RoomStaffHoursProps = {
  // The chosen sitter's staff id, or '' while none is chosen.
  staffId: string
  day: DayOfWeek
}

// Under the sitter and time fields: the hours the chosen sitter works on the chosen day. The backend
// only accepts a room that sits inside them, so the admin sees them before pressing Save instead of
// after a refusal. Sitters set their own hours on their Availability page.
export function RoomStaffHours({ staffId, day }: RoomStaffHoursProps) {
  const { data, isPending, isError } = useStaffAvailabilityQuery(staffId || undefined)

  if (!staffId) return null

  let text: string
  if (isPending) text = 'Checking their hours…'
  else if (isError || !data) text = 'Their hours could not be loaded. The server still checks them.'
  else {
    const slots = groupSlotsByDay(data).find((entry) => entry.day === day)?.slots ?? []
    text =
      slots.length === 0
        ? `Not available on ${DAY_LABEL[day]}s. Ask them to add their hours on their Availability page first.`
        : `Works ${DAY_LABEL[day]}s ${slots.map(formatSlot).join(', ')}. The room has to fit inside these hours.`
  }

  return (
    <p
      aria-live="polite"
      className="flex items-start gap-2 rounded-xl border bg-info-soft/60 p-3 text-sm"
    >
      <CalendarClock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-info" />
      {text}
    </p>
  )
}
