import { formatTimeRange } from '@/lib/format'
import { type AvailabilitySlot, DAYS_OF_WEEK, type DayOfWeek } from '@/types'

// The sitter's week: every day, Monday first, with that day's times in order. A day with no time is
// a day the sitter does not work.
export function groupSlotsByDay(
  slots: readonly AvailabilitySlot[],
): { day: DayOfWeek; slots: AvailabilitySlot[] }[] {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    slots: slots
      .filter((slot) => slot.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }))
}

// "8:00 AM – 2:00 PM"
export function formatSlot(slot: AvailabilitySlot): string {
  return formatTimeRange(slot.startTime, slot.endTime)
}
