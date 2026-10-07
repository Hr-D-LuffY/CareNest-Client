import { DAYS_OF_WEEK, type RoomWithSeats } from '@/types'

// The rooms a staff member runs, out of the whole catalogue: Monday's first, earliest start first.
export function pickRoomsRunBy(
  rooms: readonly RoomWithSeats[],
  staffId: string | undefined,
): RoomWithSeats[] {
  return rooms
    .filter((room) => room.staff.id === staffId)
    .sort(
      (a, b) =>
        DAYS_OF_WEEK.indexOf(a.dayOfWeek) - DAYS_OF_WEEK.indexOf(b.dayOfWeek) ||
        a.startTime.localeCompare(b.startTime),
    )
}
