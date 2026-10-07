// The audit-log `action` values the backend writes (docs/API.md §13, plus the wallet and transport
// ones seen in the data). Money and activity charts are built from these, so the strings live here once.
export const AuditAction = {
  BOOKING_CREATED: 'BOOKING_CREATED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  BOOKING_CHECKED_IN: 'BOOKING_CHECKED_IN',
  BOOKING_CHECKED_OUT: 'BOOKING_CHECKED_OUT',
  WAITLIST_PROMOTED: 'WAITLIST_PROMOTED',
  TRIP_ENDED: 'TRIP_ENDED',
  WALLET_TOPUP_SUCCEEDED: 'WALLET_TOPUP_SUCCEEDED',
} as const

const LABELS: Record<string, string> = {
  BOOKING_CREATED: 'Booking made',
  BOOKING_CANCELLED: 'Booking cancelled',
  BOOKING_CHECKED_IN: 'Child checked in',
  BOOKING_CHECKED_OUT: 'Child checked out',
  WAITLIST_PROMOTED: 'Promoted from waitlist',
  STAFF_VERIFIED: 'Staff verified',
  STAFF_REJECTED: 'Staff rejected',
  ROOM_DELETED: 'Room deleted',
  VEHICLE_REGISTERED: 'Vehicle registered',
  TRANSPORT_REQUESTED: 'Ride requested',
  TRANSPORT_CANCELLED: 'Ride cancelled',
  TRIP_STARTED: 'Trip started',
  TRIP_ENDED: 'Trip ended',
  RATING_CREATED: 'Rating left',
  WALLET_TOPUP_INITIATED: 'Top-up started',
  WALLET_TOPUP_SUCCEEDED: 'Top-up paid',
  WALLET_TOPUP_CANCELLED: 'Top-up cancelled',
  USER_ROLE_CHANGED: 'Role changed',
}

// "BOOKING_CHECKED_OUT" -> "Child checked out". An action the backend adds later still reads fine:
// "SOME_NEW_THING" -> "Some new thing".
export function describeAuditAction(action: string): string {
  const known = LABELS[action]
  if (known) return known
  const words = action.toLowerCase().replace(/_/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}
