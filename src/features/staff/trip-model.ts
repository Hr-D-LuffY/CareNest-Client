import { TransportStatus, type Trip } from '@/types'
import { getDateLabel } from './task-model'

// Where a trip is in the driver's day. It decides which action (if any) is offered.
//   on-the-way  started, not ended                    -> "End trip"
//   ready       its session is today                  -> "Start trip"
//   upcoming    its session is on a later day         -> a trip can only start on the session date
//   missed      its session day passed, never started -> the backend refuses to start it now
export type TripPhase = 'on-the-way' | 'ready' | 'upcoming' | 'missed'

// `today` is "YYYY-MM-DD" (todayIso(), the same UTC day the backend uses to allow a start).
export function getTripPhase(trip: Trip, today: string): TripPhase {
  if (trip.status === TransportStatus.IN_PROGRESS) return 'on-the-way'
  if (trip.booking.sessionDate === today) return 'ready'
  return trip.booking.sessionDate > today ? 'upcoming' : 'missed'
}

// "On the way · 12 min". `now` is null until the page has mounted, so server and first client render
// agree (see useNow). The backend rounds a trip up to whole minutes, so this does too.
export function formatOnTheWay(tripStart: string, now: number | null): string {
  if (now === null) return 'On the way'
  const minutes = Math.max(0, Math.ceil((now - Date.parse(tripStart)) / 60_000))
  return minutes < 1 ? 'Just started' : `On the way · ${minutes} min`
}

export type TripDay = { date: string; label: string; trips: Trip[] }

// Trips grouped by session day, earliest first, so "Today" is at the top and a missed day (the
// oldest) is easy to spot.
export function groupTripsByDay(trips: readonly Trip[], today: string): TripDay[] {
  const days = new Map<string, TripDay>()
  for (const trip of trips) {
    const date = trip.booking.sessionDate
    const day = days.get(date)
    if (day) day.trips.push(trip)
    else days.set(date, { date, label: getDateLabel(date, today), trips: [trip] })
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date))
}
