import { calculateFare } from '@/lib/fare'
import type { Room } from '@/types'

// A room's price for one hour: the sitter's hourly rate × the room multiplier, e.g. "250.00". Null
// while the sitter has no hourly rate yet.
export function getHourlyPrice(room: Pick<Room, 'staff' | 'priceMultiplier'>) {
  const { hourlyRate } = room.staff
  return hourlyRate === null ? null : calculateFare(1, hourlyRate, room.priceMultiplier)
}
