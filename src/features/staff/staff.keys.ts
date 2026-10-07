import type { StaffTaskListParams, StaffTripListParams } from '@/types'
import type { EarningsWindow } from './earnings.params'
import type { StaffRatingsParams } from './staff.params'

// Query keys for the staff feature. Kept out of staff.queries.ts ("use client") so a server page can
// use the same keys when it hands data to the client.
export const staffKeys = {
  all: ['staff'] as const,
  ratings: (staffId: string, params: StaffRatingsParams) =>
    [...staffKeys.all, 'ratings', staffId, params] as const,
  // The signed-in staff member's own profile (GET /staff/me).
  me: () => [...staffKeys.all, 'me'] as const,
  // The days and hours a staff member works (GET /staff/:staffId/availability).
  availability: (staffId: string) => [...staffKeys.all, 'availability', staffId] as const,
  // The sitter's task board (GET /staff/me/bookings). A check-out invalidates tasks().
  tasks: () => [...staffKeys.all, 'tasks'] as const,
  taskList: (params: StaffTaskListParams) => [...staffKeys.tasks(), params] as const,
  // The driver's trips (GET /staff/me/trips). Starting or ending a trip invalidates trips().
  trips: () => [...staffKeys.all, 'trips'] as const,
  tripList: (params: StaffTripListParams) => [...staffKeys.trips(), params] as const,
  // What the staff member earned in a window (GET /staff/me/earnings). A check-out or an ended trip
  // invalidates earnings().
  earnings: () => [...staffKeys.all, 'earnings'] as const,
  earningsWindow: (window: EarningsWindow) => [...staffKeys.earnings(), window] as const,
  // Mutation keys, not cache entries: they let the boards see which bookings and trips have a
  // request running.
  taskActions: ['staff', 'task-action'] as const,
  checkIn: ['staff', 'task-action', 'check-in'] as const,
  checkOut: ['staff', 'task-action', 'check-out'] as const,
  tripActions: ['staff', 'trip-action'] as const,
  startTrip: ['staff', 'trip-action', 'start'] as const,
  endTrip: ['staff', 'trip-action', 'end'] as const,
}
