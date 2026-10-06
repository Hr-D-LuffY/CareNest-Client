import type { RoomListParams } from '@/types'

// Query keys for the room feature. Kept out of room.queries.ts ("use client") so the server page
// can use the same keys when it prefetches the list.
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (params: RoomListParams) => [...roomKeys.lists(), params] as const,
  // One room with its seats for a session date ("next" when no date is given).
  detail: (id: string, date?: string) => [...roomKeys.all, 'detail', id, date ?? 'next'] as const,
}
