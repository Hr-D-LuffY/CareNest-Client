import type { ApiResult } from '@/lib/api/core'
import type { AssignedBooking, Paginated, StaffRatings, StaffRatingsPage, Trip } from '@/types'

// Reviews shown per page on a room's detail page.
export const REVIEWS_PAGE_SIZE = 5

// Query params of GET /staff/:id/ratings.
export type StaffRatingsParams = { page: number; limit: number }

// GET /staff/me/bookings sends `sessionDate` as a full timestamp ("2026-10-07T00:00:00.000Z"), while
// every other endpoint sends the calendar day ("2026-10-07"). The whole app (comparing with today,
// formatting, grouping) works on the calendar day, so it is cut down to that once, here.
export function toTasksPage({
  items,
  meta,
}: Paginated<AssignedBooking>): Paginated<AssignedBooking> {
  return {
    items: items.map((task) => ({ ...task, sessionDate: task.sessionDate.slice(0, 10) })),
    meta,
  }
}

// GET /staff/me/trips has the same quirk: `booking.sessionDate` is a full timestamp.
export function toTripsPage({ items, meta }: Paginated<Trip>): Paginated<Trip> {
  return {
    items: items.map((trip) => ({
      ...trip,
      booking: { ...trip.booking, sessionDate: trip.booking.sessionDate.slice(0, 10) },
    })),
    meta,
  }
}

// The ratings endpoint answers { average, count, reviews } with the paging meta beside it. This
// folds the two together, with a one-page fallback if the backend ever leaves the meta out.
export function toStaffRatingsPage({ data, meta }: ApiResult<StaffRatings>): StaffRatingsPage {
  return {
    ...data,
    meta: meta ?? { page: 1, limit: data.reviews.length, total: data.reviews.length },
  }
}
