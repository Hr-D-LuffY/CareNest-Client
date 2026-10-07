import type { BookingStatus, DayOfWeek, Tier, WaitlistStatus } from './enums'

// POST /booking body. `sessionDate` is "YYYY-MM-DD" and must fall on the room's weekday.
export type CreateBookingPayload = {
  childId: string
  roomId: string
  sessionDate: string
}

// Query params of GET /booking and GET /booking/waitlist. `status` filters; paging is 1-based.
export type BookingListParams = {
  page: number
  limit: number
  status?: BookingStatus
}

export type WaitlistListParams = {
  page: number
  limit: number
  status?: WaitlistStatus
}

export type Booking = {
  id: string
  sessionDate: string
  status: BookingStatus
  estimatedFee: string
  finalFee: string | null
  insufficientBalance: boolean
  createdAt: string
  child: { id: string; name: string }
  room: {
    id: string
    name: string
    dayOfWeek: DayOfWeek
    startTime: string
    endTime: string
  }
}

// POST /booking answers 202 with this when the room is full.
export type WaitlistEntry = {
  id: string
  sessionDate: string
  status: WaitlistStatus
  priorityScore: number
  joinedAt: string
  room: { id: string; name: string }
  child: { id: string; name: string; tier: Tier }
}

// GET /room/:id/waitlist (the staff member who runs the room, or an admin): the pending entries with
// the guardian who is waiting.
export type RoomWaitlistEntry = WaitlistEntry & {
  guardian: { id: string; user: { name: string } }
}

// Query params of GET /room/:id/waitlist. `date` ("YYYY-MM-DD") limits it to one session's queue;
// without it every session's queue comes back, best score first.
export type RoomWaitlistParams = {
  page: number
  limit: number
  date?: string
}

// POST /booking/:id/check-in and /check-out
export type CheckinLog = {
  id: string
  checkInAt: string
  checkOutAt: string | null
  hoursUsed: string | null
  booking: Booking
}

// POST /booking returns 201 (a confirmed Booking) or 202 (a WaitlistEntry). The HTTP status tells
// them apart, so the API layer returns this tagged union.
export type CreateBookingResult =
  | { outcome: 'confirmed'; booking: Booking }
  | { outcome: 'waitlisted'; entry: WaitlistEntry }
