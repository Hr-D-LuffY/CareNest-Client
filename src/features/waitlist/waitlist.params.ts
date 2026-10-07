import { parseSessionDateParam } from '@/features/room/room.params'
import { DEFAULT_PAGE } from '@/lib/constants'
import type { RoomWaitlistParams } from '@/types'

// Rows per page of a room's queue.
export const ROOM_WAITLIST_PAGE_SIZE = 10

// How often an open queue asks the backend again, so a cancellation that promotes the next child
// shows up without a refresh.
export const WAITLIST_REFRESH_MS = 30_000

// What the page shows, read from the URL (?date=&page=).
export type RoomWaitlistView = {
  page: number
  // One session's queue ("YYYY-MM-DD"), or undefined for every session.
  date?: string
}

// The view's params from the raw URL values. A hand-edited URL falls back to "all sessions, page 1"
// instead of reaching the backend as a 400. Both the server page (prefetch) and the client list call
// this, so they build the same query key.
export function parseRoomWaitlistView(raw: {
  page?: string | null
  date?: string | null
}): RoomWaitlistView {
  const page = Number(raw.page)
  const date = parseSessionDateParam(raw.date)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    ...(date && { date }),
  }
}

export function toRoomWaitlistParams({ page, date }: RoomWaitlistView): RoomWaitlistParams {
  return { page, limit: ROOM_WAITLIST_PAGE_SIZE, ...(date && { date }) }
}

// Just the total, for the "N waiting" count on a room card: one row is enough.
export const WAITLIST_COUNT_PARAMS: RoomWaitlistParams = { page: DEFAULT_PAGE, limit: 1 }

// How long a child has been waiting: "35 min", "5 h 20 min", "2 d 4 h" (a zero part is left out).
export function formatWaited(joinedAt: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - Date.parse(joinedAt)) / 60_000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const [wholeMinutes, wholeHours] = [minutes % 60, hours % 24]
  if (hours < 24) return wholeMinutes === 0 ? `${hours} h` : `${hours} h ${wholeMinutes} min`
  return wholeHours === 0
    ? `${Math.floor(hours / 24)} d`
    : `${Math.floor(hours / 24)} d ${wholeHours} h`
}
