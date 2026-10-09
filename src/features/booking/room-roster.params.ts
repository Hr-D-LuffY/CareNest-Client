import { weekdayOf } from '@/features/room/room.params'
import { DEFAULT_PAGE } from '@/lib/constants'
import { addDaysIso } from '@/lib/format'
import { BookingStatus, type DayOfWeek, type RoomBookingParams } from '@/types'

// Rows per page of a room's booking list.
export const ROOM_ROSTER_PAGE_SIZE = 10

// How often an open list asks the backend again, so a cancellation or a check-in shows up by itself.
export const ROOM_ROSTER_REFRESH_MS = 30_000

// The URL keys of the list. They are prefixed because the room page also shows the waitlist, which
// owns ?date= and ?page=.
export const ROSTER_DATE_KEY = 'rdate'
export const ROSTER_STATUS_KEY = 'rstatus'
export const ROSTER_PAGE_KEY = 'rpage'

// The statuses the filter offers. A waitlisted child holds no seat, so it is not a booking row.
export const ROSTER_STATUSES = [
  BookingStatus.CONFIRMED,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
] as const

// What the list shows, read from the URL (?rdate=&rstatus=&rpage=).
export type RoomRosterView = {
  page: number
  // The session ("YYYY-MM-DD"). Always set: the room's next session unless the URL picks another.
  date: string
  status?: BookingStatus
}

// A real calendar day in "YYYY-MM-DD" form.
function isRealDay(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const parsed = new Date(`${date}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
}

// The view from the raw URL values. Unlike the waitlist, past sessions are allowed (an admin can look
// back at who attended), but the day must fall on the room's weekday: the backend answers 400
// otherwise, so a hand-edited URL falls back to the next session instead. Both the server page
// (prefetch) and the client list call this, so they build the same query key.
export function parseRoomRosterView(
  raw: { page?: string | null; date?: string | null; status?: string | null },
  room: { dayOfWeek: DayOfWeek; sessionDate: string },
): RoomRosterView {
  const page = Number(raw.page)
  const date =
    raw.date && isRealDay(raw.date) && weekdayOf(raw.date) === room.dayOfWeek
      ? raw.date
      : room.sessionDate
  const status = ROSTER_STATUSES.find((option) => option === raw.status)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    date,
    ...(status && { status }),
  }
}

export function toRoomRosterParams({ page, date, status }: RoomRosterView): RoomBookingParams {
  return { page, limit: ROOM_ROSTER_PAGE_SIZE, date, ...(status && { status }) }
}

// How many past and upcoming sessions the picker offers around the room's next session.
const PAST_SESSIONS = 2
const UPCOMING_SESSIONS = 4
const DAYS_IN_WEEK = 7

// A room repeats every week: the last couple of sessions, the next one and the few after it, plus the
// picked date when it is further away.
export function rosterSessions(nextSession: string, picked: string): string[] {
  const dates = Array.from({ length: PAST_SESSIONS + UPCOMING_SESSIONS }, (_, index) =>
    addDaysIso(nextSession, (index - PAST_SESSIONS) * DAYS_IN_WEEK),
  )
  return dates.includes(picked) ? dates : [...dates, picked].sort()
}
