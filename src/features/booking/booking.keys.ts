import type { BookingListParams, RoomBookingParams, WaitlistListParams } from '@/types'

// Query keys for the booking feature. Kept out of booking.queries.ts ("use client") so server pages
// can use the same keys. A new booking, a cancellation or a waitlist change invalidates
// bookingKeys.all.
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (params: BookingListParams) => [...bookingKeys.lists(), params] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
  waitlists: () => [...bookingKeys.all, 'waitlist'] as const,
  waitlist: (params: WaitlistListParams) => [...bookingKeys.waitlists(), params] as const,
  // Who is booked into one room (GET /room/:id/bookings), for the admin and the room's sitter.
  roomRosters: (roomId: string) => [...bookingKeys.all, 'room', roomId] as const,
  roomRoster: (roomId: string, params: RoomBookingParams) =>
    [...bookingKeys.roomRosters(roomId), params] as const,
}
