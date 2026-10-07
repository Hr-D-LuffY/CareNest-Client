import 'server-only'
import { type Loaded, mapLoaded, settle } from '@/lib/api/loaded'
import { serverApi } from '@/lib/api/server'
import { MAX_PAGE_SIZE } from '@/lib/constants'
import { addDaysIso, dayInAppZone, todayInAppZone, todayIso } from '@/lib/format'
import {
  type AuditLog,
  type DashboardStats,
  DayOfWeek,
  Role,
  type RoomWithSeats,
  VerificationStatus,
} from '@/types'
import { type AnalyticsRange, getRangeOption, OCCUPANCY_DAYS } from './analytics.params'
import {
  buildDayPoints,
  buildDays,
  buildOccupancyDays,
  buildRoomFills,
  type DayPoint,
  type OccupancyDay,
  type People,
  type RoomFill,
} from './analytics-model'

// The platform numbers behind the admin overview: revenue, active bookings, occupancy, waitlist
// conversion and the top-rated staff.
const getDashboardStats = () => serverApi.get<DashboardStats>('/admin/dashboard-stats')

// The audit log is read newest first, ten pages of a hundred at most. That is far more than a month
// of a platform this size, and it keeps one page load from turning into dozens of requests.
const AUDIT_MAX_PAGES = 10

type AuditWindow = {
  logs: AuditLog[]
  // True when the log is longer than what was read and the oldest row read is still inside the
  // period, so the oldest days may be missing events.
  truncated: boolean
}

async function getAuditLogsSince(sinceDay: string): Promise<AuditWindow> {
  const first = await serverApi.getList<AuditLog>('/admin/audit-logs', {
    page: 1,
    limit: MAX_PAGE_SIZE,
  })
  const pages = Math.min(AUDIT_MAX_PAGES, Math.ceil(first.meta.total / first.meta.limit))
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, index) =>
      serverApi.getList<AuditLog>('/admin/audit-logs', { page: index + 2, limit: MAX_PAGE_SIZE }),
    ),
  )
  const logs = [...first.items, ...rest.flatMap((page) => page.items)]
  const oldest = logs.at(-1)
  const reachedStart = oldest ? dayInAppZone(oldest.createdAt) <= sinceDay : true
  return { logs, truncated: logs.length < first.meta.total && !reachedStart }
}

const DAYS_BY_INDEX = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
]

// The rooms that run on `date`, with the seats taken that day. The backend only answers for today
// or later, and a room repeats weekly, so only the rooms of that weekday are asked for.
function getRoomsOn(date: string) {
  const weekday = DAYS_BY_INDEX[new Date(`${date}T00:00:00Z`).getUTCDay()]
  return serverApi
    .getList<RoomWithSeats>('/room', { date, dayOfWeek: weekday, page: 1, limit: MAX_PAGE_SIZE })
    .then((page) => page.items)
}

const total = (path: string, query: Record<string, string>) =>
  serverApi.getList<unknown>(path, { ...query, page: 1, limit: 1 }).then((page) => page.meta.total)

async function getPeople(): Promise<People> {
  const [guardians, staff, verified, unverified, rejected] = await Promise.all([
    total('/admin/users', { role: Role.GUARDIAN }),
    total('/admin/users', { role: Role.STAFF }),
    total('/admin/staff', { verificationStatus: VerificationStatus.VERIFIED }),
    total('/admin/staff', { verificationStatus: VerificationStatus.UNVERIFIED }),
    total('/admin/staff', { verificationStatus: VerificationStatus.REJECTED }),
  ])
  return { guardians, staff, verified, unverified, rejected }
}

// What the audit log tells us about the last days: money and activity per day, and the newest events.
type History = {
  // The period the revenue and activity charts cover, and the same length just before it.
  days: DayPoint[]
  previousDays: DayPoint[]
  // Set when older events may be missing, so the earlier period is not compared.
  truncated: boolean
  // The newest audit entries, for the activity feed.
  recent: AuditLog[]
}

export type Analytics = {
  rangeTitle: string
  rangeDays: number
  stats: Loaded<DashboardStats>
  history: Loaded<History>
  // Seats per day for the next OCCUPANCY_DAYS days.
  occupancy: Loaded<OccupancyDay[]>
  rooms: Loaded<RoomFill[]>
  people: Loaded<People>
}

const RECENT_ACTIVITY = 8

// Everything the analytics board draws. Every section is requested at once and fails on its own, so
// one slow or failing endpoint shows an inline message while the rest of the board still renders.
export async function getAnalytics(range: AnalyticsRange): Promise<Analytics> {
  const option = getRangeOption(range)
  const today = todayInAppZone()
  const allDays = buildDays(option.days * 2, today)
  const previousDates = allDays.slice(0, option.days)
  const dates = allDays.slice(option.days)

  const seatDates = Array.from({ length: OCCUPANCY_DAYS }, (_, index) =>
    addDaysIso(todayIso(), index),
  )

  const [stats, audit, seats, rooms, people] = await Promise.allSettled([
    getDashboardStats(),
    getAuditLogsSince(previousDates[0] ?? today),
    Promise.all(seatDates.map(getRoomsOn)),
    serverApi
      .getList<RoomWithSeats>('/room', {
        page: 1,
        limit: MAX_PAGE_SIZE,
        sortBy: 'name',
        sortOrder: 'asc',
      })
      .then((page) => page.items),
    getPeople(),
  ])

  return {
    rangeTitle: option.title,
    rangeDays: option.days,
    stats: settle(stats),
    history: mapLoaded(settle(audit), ({ logs, truncated }) => ({
      days: buildDayPoints(logs, dates, today),
      previousDays: buildDayPoints(logs, previousDates, today),
      truncated,
      recent: logs.slice(0, RECENT_ACTIVITY),
    })),
    occupancy: mapLoaded(settle(seats), (byDate) => buildOccupancyDays(seatDates, byDate)),
    rooms: mapLoaded(settle(rooms), buildRoomFills),
    people: settle(people),
  }
}
