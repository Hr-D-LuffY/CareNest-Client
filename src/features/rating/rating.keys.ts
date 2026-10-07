// Query keys for the rating feature. Kept out of rating.queries.ts ("use client") so server pages can
// use the same keys.
export const ratingKeys = {
  all: ['ratings'] as const,
  // The rating this guardian already left for one staff member on one booking (or null).
  forBooking: (staffId: string, bookingId: string) =>
    [...ratingKeys.all, 'booking', bookingId, staffId] as const,
}
