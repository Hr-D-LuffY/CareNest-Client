import type { Paginated, Transport } from '@/types'

// How many rides or vehicles are asked for in one go when looking something up. 100 is the
// backend's cap per page.
export const LOOKUP_PAGE_SIZE = 100

// The vehicles the ride form offers.
export const VEHICLES_PARAMS = { page: 1, limit: LOOKUP_PAGE_SIZE } as const

// There is no "ride of this booking" endpoint (GET /transport only lists), so the booking's ride is
// found in the guardian's latest rides. A booking has at most one ride (the backend keeps one per
// booking).
export function findRideForBooking(
  page: Paginated<Transport>,
  bookingId: string,
): Transport | null {
  return page.items.find((ride) => ride.booking.id === bookingId) ?? null
}
