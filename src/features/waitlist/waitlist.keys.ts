import type { RoomWaitlistParams } from '@/types'

// Query keys for the waitlist feature. Kept out of waitlist.queries.ts ("use client") so a server
// page can use the same keys when it prefetches.
export const waitlistKeys = {
  all: ['waitlist'] as const,
  // The queue of one room (GET /room/:id/waitlist). A cancellation that promotes a child changes it.
  room: (roomId: string) => [...waitlistKeys.all, 'room', roomId] as const,
  roomList: (roomId: string, params: RoomWaitlistParams) =>
    [...waitlistKeys.room(roomId), params] as const,
}
