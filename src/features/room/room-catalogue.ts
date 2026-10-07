import { MAX_PAGE_SIZE } from '@/lib/constants'
import type { Paginated, RoomListParams, RoomWithSeats } from '@/types'

// The query of one page of the whole catalogue: the biggest page the backend allows.
export const catalogueParams = (page: number): RoomListParams => ({
  page,
  limit: MAX_PAGE_SIZE,
  sortBy: 'name',
  sortOrder: 'asc',
})

// Every room, however many pages there are. The backend has no filter for "rooms run by this staff
// member", but the catalogue is small and admin-managed, so the staff pages read all of it and keep
// their own. `fetchPage` is the browser or the server version of GET /room.
export async function collectAllRooms(
  fetchPage: (page: number) => Promise<Paginated<RoomWithSeats>>,
): Promise<RoomWithSeats[]> {
  const first = await fetchPage(1)
  const pages = Math.max(1, Math.ceil(first.meta.total / first.meta.limit))
  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) => fetchPage(index + 2)),
  )
  return [...first.items, ...rest.flatMap((page) => page.items)]
}
