import type { DayOfWeek, StaffType, Tier } from './enums'

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
  }
}

// GET /room, /room/search, /room/:id: a room plus seat availability for one session date.
export type RoomWithSeats = Room & {
  bookedSeats: number
  seatsLeft: number
  sessionDate: string
}
