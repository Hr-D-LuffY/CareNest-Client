import type { StaffTaskListParams } from '@/types'
import type { StaffRatingsParams } from './staff.params'

// Query keys for the staff feature. Kept out of staff.queries.ts ("use client") so a server page can
// use the same keys when it hands data to the client.
export const staffKeys = {
  all: ['staff'] as const,
  ratings: (staffId: string, params: StaffRatingsParams) =>
    [...staffKeys.all, 'ratings', staffId, params] as const,
  // The days and hours a staff member works (GET /staff/:staffId/availability).
  availability: (staffId: string) => [...staffKeys.all, 'availability', staffId] as const,
  // The sitter's task board (GET /staff/me/bookings). A check-out invalidates tasks().
  tasks: () => [...staffKeys.all, 'tasks'] as const,
  taskList: (params: StaffTaskListParams) => [...staffKeys.tasks(), params] as const,
  // Mutation keys, not cache entries: they let the board see which bookings have a request running.
  taskActions: ['staff', 'task-action'] as const,
  checkIn: ['staff', 'task-action', 'check-in'] as const,
  checkOut: ['staff', 'task-action', 'check-out'] as const,
}
