import { addDaysIso, dayInAppZone, formatBDT } from '@/lib/format'
import type { AuditLog, RoomWithSeats } from '@/types'
import { AuditAction } from './audit-actions'

// Everything the analytics board draws, worked out from real backend data and nothing else:
//   - money per day comes from the audit log (a check-out's final fee and an ended trip's fare, only
//     when the wallet was actually charged). Together they add up to the backend's `totalRevenue`.
//   - seats per day come from GET /room?date=, which the backend only answers for today onward.
// Money is summed as whole cents (never as floats) and printed through formatBDT.

const dayLabel = (date: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  )

const weekdayLabel = (date: string) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  )

// "113.50" -> 11350. A metadata value is a string or a number; anything else counts as nothing.
function toCents(value: unknown): number {
  const amount = typeof value === 'string' || typeof value === 'number' ? Number(value) : 0
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0
}

const centsToText = (cents: number) => (cents / 100).toFixed(2)
export const formatCents = (cents: number) => formatBDT(centsToText(cents))

// ---------------------------------------------------------------- money and activity per day

export type DayPoint = {
  date: string
  label: string
  weekday: string
  isToday: boolean
  careCents: number
  tripsCents: number
  totalCents: number
  topUpCents: number
  // The two money streams in whole taka, for the bar chart's axis only (never printed as money).
  care: number
  trips: number
  bookings: number
  cancellations: number
  promotions: number
}

// The `count` calendar days ending on `today`, oldest first.
export function buildDays(count: number, today: string): string[] {
  return Array.from({ length: count }, (_, index) => addDaysIso(today, index - (count - 1)))
}

function emptyPoint(date: string, today: string): DayPoint {
  return {
    date,
    label: dayLabel(date),
    weekday: weekdayLabel(date),
    isToday: date === today,
    careCents: 0,
    tripsCents: 0,
    totalCents: 0,
    topUpCents: 0,
    care: 0,
    trips: 0,
    bookings: 0,
    cancellations: 0,
    promotions: 0,
  }
}

const meta = (log: AuditLog, key: string): unknown => log.metadata?.[key]

// One point per day. The audit log is the only place the backend keeps what happened on which day.
export function buildDayPoints(logs: AuditLog[], dates: string[], today: string): DayPoint[] {
  const points = new Map(dates.map((date) => [date, emptyPoint(date, today)]))

  for (const log of logs) {
    const point = points.get(dayInAppZone(log.createdAt))
    if (!point) continue
    switch (log.action) {
      case AuditAction.BOOKING_CHECKED_OUT:
        if (meta(log, 'charged') === true) point.careCents += toCents(meta(log, 'finalFee'))
        break
      case AuditAction.TRIP_ENDED:
        if (meta(log, 'charged') === true) point.tripsCents += toCents(meta(log, 'fare'))
        break
      case AuditAction.WALLET_TOPUP_SUCCEEDED:
        point.topUpCents += toCents(meta(log, 'amount'))
        break
      case AuditAction.BOOKING_CREATED:
        point.bookings += 1
        break
      case AuditAction.BOOKING_CANCELLED:
        point.cancellations += 1
        break
      case AuditAction.WAITLIST_PROMOTED:
        point.promotions += 1
        break
    }
  }

  return dates.flatMap((date) => {
    const point = points.get(date)
    if (!point) return []
    point.totalCents = point.careCents + point.tripsCents
    point.care = point.careCents / 100
    point.trips = point.tripsCents / 100
    return [point]
  })
}

export function isDayPoint(value: unknown): value is DayPoint {
  return (
    typeof value === 'object' &&
    value !== null &&
    'date' in value &&
    'totalCents' in value &&
    'bookings' in value
  )
}

export type PeriodSummary = {
  revenueCents: number
  careCents: number
  tripsCents: number
  topUpCents: number
  bookings: number
  cancellations: number
  promotions: number
}

export function summarise(points: DayPoint[]): PeriodSummary {
  const sum = (pick: (point: DayPoint) => number) =>
    points.reduce((total, point) => total + pick(point), 0)

  return {
    revenueCents: sum((point) => point.totalCents),
    careCents: sum((point) => point.careCents),
    tripsCents: sum((point) => point.tripsCents),
    topUpCents: sum((point) => point.topUpCents),
    bookings: sum((point) => point.bookings),
    cancellations: sum((point) => point.cancellations),
    promotions: sum((point) => point.promotions),
  }
}

// How much a number moved against the period before it, in whole percent. null when there is no
// earlier number to compare with (a rise from zero has no percentage).
export function changePercent(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

// ---------------------------------------------------------------- seats per upcoming day

export type OccupancyDay = {
  date: string
  label: string
  weekday: string
  // How many rooms run that day, their seats, and how many are taken.
  sessions: number
  capacity: number
  booked: number
  free: number
  // null on a day with no sessions: there is nothing to be a percentage of.
  percent: number | null
}

const percentOf = (part: number, whole: number) =>
  whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0

export function buildOccupancyDays(
  dates: string[],
  roomsByDate: RoomWithSeats[][],
): OccupancyDay[] {
  return dates.map((date, index) => {
    const rooms = roomsByDate[index] ?? []
    const capacity = rooms.reduce((total, room) => total + room.capacity, 0)
    const booked = rooms.reduce((total, room) => total + room.bookedSeats, 0)
    return {
      date,
      label: dayLabel(date),
      weekday: weekdayLabel(date),
      sessions: rooms.length,
      capacity,
      booked,
      free: Math.max(0, capacity - booked),
      percent: rooms.length === 0 ? null : percentOf(booked, capacity),
    }
  })
}

export function isOccupancyDay(value: unknown): value is OccupancyDay {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sessions' in value &&
    'capacity' in value &&
    'booked' in value
  )
}

export type RoomFill = {
  id: string
  name: string
  tier: RoomWithSeats['tier']
  staffName: string
  sessionLabel: string
  startTime: string
  endTime: string
  capacity: number
  booked: number
  percent: number
}

// Every room at its next session, fullest first.
export function buildRoomFills(rooms: RoomWithSeats[]): RoomFill[] {
  return rooms
    .map((room) => ({
      id: room.id,
      name: room.name,
      tier: room.tier,
      staffName: room.staff.user.name,
      sessionLabel: `${weekdayLabel(room.sessionDate)}, ${dayLabel(room.sessionDate)}`,
      startTime: room.startTime,
      endTime: room.endTime,
      capacity: room.capacity,
      booked: room.bookedSeats,
      percent: percentOf(room.bookedSeats, room.capacity),
    }))
    .sort((a, b) => b.percent - a.percent || a.name.localeCompare(b.name))
}

// ---------------------------------------------------------------- people

export type People = {
  guardians: number
  staff: number
  verified: number
  unverified: number
  rejected: number
}
