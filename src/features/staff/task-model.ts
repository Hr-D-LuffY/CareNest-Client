import { addDaysIso, formatSessionDate } from '@/lib/format'
import { type AssignedBooking, type AvailabilitySlot, DayOfWeek } from '@/types'
import { LATER_DATES, MISSED_DATES } from './task.params'

// Where a booking is in the sitter's day. It decides which lane a child is in and which action
// (if any) is offered.
//   ready     session is today, child not here yet  -> "Check in"
//   in-care   checked in, not checked out           -> "Check out"
//   upcoming  session is on a later day             -> check-in opens that day
//   missed    session day passed with no check-in   -> the backend only checks in on the session day
export type TaskPhase = 'ready' | 'in-care' | 'upcoming' | 'missed'

// `today` is "YYYY-MM-DD" (todayIso(), the same UTC day the backend uses for check-in).
export function getTaskPhase(task: AssignedBooking, today: string): TaskPhase {
  if (task.checkinLog && !task.checkinLog.checkOutAt) return 'in-care'
  if (task.sessionDate === today) return 'ready'
  return task.sessionDate > today ? 'upcoming' : 'missed'
}

export type PhaseCounts = Record<TaskPhase, number>

export function countPhases(tasks: readonly AssignedBooking[], today: string): PhaseCounts {
  const counts: PhaseCounts = { ready: 0, 'in-care': 0, upcoming: 0, missed: 0 }
  for (const task of tasks) counts[getTaskPhase(task, today)] += 1
  return counts
}

export type TaskDay = {
  date: string
  // Children booked that day, including those already in care.
  count: number
  // Whether the sitter works that weekday. null when their availability could not be read, so the
  // calendar says nothing instead of guessing.
  available: boolean | null
}

const WEEKDAYS: readonly DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
]

// "2026-10-14" -> "WEDNESDAY". A session date is a calendar day, so it is read as UTC.
export function getDayOfWeek(date: string): DayOfWeek {
  return WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()]
}

// The weekdays the sitter has an availability slot for, or null while that is unknown.
export function toAvailableDays(
  slots: readonly AvailabilitySlot[] | undefined,
): ReadonlySet<DayOfWeek> | null {
  return slots ? new Set(slots.map((slot) => slot.dayOfWeek)) : null
}

// The calendar shows today and the 13 days after it: two rows of seven. Seven would not be enough.
// A weekly room's next class is exactly 7 days after today's, so on class day it would always fall
// just outside the calendar.
export const CALENDAR_DAYS = 14

// Each calendar day with how many children are booked and whether the sitter works that weekday.
// This is what the calendar's tiles show.
export function getCalendarDays(
  tasks: readonly AssignedBooking[],
  today: string,
  availableDays: ReadonlySet<DayOfWeek> | null,
): TaskDay[] {
  const counts = new Map<string, number>()
  for (const task of tasks) counts.set(task.sessionDate, (counts.get(task.sessionDate) ?? 0) + 1)
  return Array.from({ length: CALENDAR_DAYS }, (_, offset) => {
    const date = addDaysIso(today, offset)
    return {
      date,
      count: counts.get(date) ?? 0,
      available: availableDays ? availableDays.has(getDayOfWeek(date)) : null,
    }
  })
}

// The last day the calendar covers.
export function getCalendarEnd(today: string): string {
  return addDaysIso(today, CALENDAR_DAYS - 1)
}

// The children behind a ?date= choice: one day, the sessions after the calendar's last day, or the
// missed ones.
export function selectTasks(
  tasks: readonly AssignedBooking[],
  selected: string,
  today: string,
): AssignedBooking[] {
  if (selected === LATER_DATES) {
    return tasks.filter((task) => task.sessionDate > getCalendarEnd(today))
  }
  if (selected === MISSED_DATES) {
    return tasks.filter((task) => getTaskPhase(task, today) === 'missed')
  }
  return tasks.filter((task) => task.sessionDate === selected)
}

// "Today", "Tomorrow", or "Fri, 9 Oct".
export function getDateLabel(sessionDate: string, today: string): string {
  if (sessionDate === today) return 'Today'
  if (sessionDate === addDaysIso(today, 1)) return 'Tomorrow'
  return formatSessionDate(sessionDate)
}

// "In care · 1h 20m". `now` is null until the page has mounted, so server and first client render
// agree (see useNow).
export function formatInCare(checkInAt: string, now: number | null): string {
  if (now === null) return 'In care'
  const minutes = Math.max(0, Math.floor((now - Date.parse(checkInAt)) / 60_000))
  if (minutes < 1) return 'Just checked in'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `In care · ${hours > 0 ? `${hours}h ${rest}m` : `${rest}m`}`
}

export type TaskSession = {
  key: string
  sessionDate: string
  room: AssignedBooking['room']
  tasks: AssignedBooking[]
}

// One room on one day, with the children booked into it: the sitter's roll call. Earliest day and
// start time first. The backend already sorts by day, so a room's children stay in booking order.
export function groupSessions(tasks: readonly AssignedBooking[]): TaskSession[] {
  const sessions = new Map<string, TaskSession>()
  for (const task of tasks) {
    const key = `${task.sessionDate}|${task.room.id}`
    const session = sessions.get(key)
    if (session) session.tasks.push(task)
    else sessions.set(key, { key, sessionDate: task.sessionDate, room: task.room, tasks: [task] })
  }
  return [...sessions.values()].sort(
    (a, b) =>
      a.sessionDate.localeCompare(b.sessionDate) ||
      a.room.startTime.localeCompare(b.room.startTime),
  )
}
