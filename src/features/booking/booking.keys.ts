// Query keys for the booking feature. Kept out of booking.queries.ts ("use client") so server pages
// can use the same keys. A new booking or waitlist entry invalidates bookingKeys.all.
export const bookingKeys = {
  all: ['bookings'] as const,
}
