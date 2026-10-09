import type { DayOfWeek, RoomStatus, StaffType, Tier } from './enums'

export type Room = {
  id: string
  name: string
  tier: Tier
  capacity: number
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  priceMultiplier: string
  createdAt: string
  updatedAt: string
  staff: {
    id: string
    staffType: StaffType
    user: { name: string }
    // The sitter's price per hour, as a string, or null while the sitter has no rate yet.
    hourlyRate: string | null
  }
}

// GET /room, /room/search, /room/:id: a room plus seat availability for one session date.
export type RoomWithSeats = Room & {
  bookedSeats: number
  seatsLeft: number
  sessionDate: string
}

// Query params of GET /room (backend: room.interface.ts). `date` is "YYYY-MM-DD"; `q` matches the
// room name or the staff member's name.
export type RoomListParams = {
  page: number
  limit: number
  tier?: Tier
  status?: RoomStatus
  dayOfWeek?: DayOfWeek
  date?: string
  q?: string
  sortBy: 'createdAt' | 'name' | 'startTime' | 'capacity' | 'priceMultiplier' | 'seatsLeft'
  sortOrder: 'asc' | 'desc'
}

// POST /room body (admin). The sitter must be verified and free at that time, and the room's window
// must sit inside the sitter's weekly availability. `priceMultiplier` defaults to 1 on the backend.
export type CreateRoomPayload = {
  name: string
  tier: Tier
  capacity: number
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  staffId: string
  priceMultiplier?: number
}

// PATCH /room/:id body (admin): any of the fields, at least one.
export type UpdateRoomPayload = Partial<CreateRoomPayload>
