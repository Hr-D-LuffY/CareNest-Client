import { clientApi } from '@/lib/api/client'
import type { RoomWaitlistEntry, RoomWaitlistParams } from '@/types'

// One function per endpoint, for the browser (through the BFF). Server pages use waitlist.server.ts.
export const waitlistApi = {
  // The pending queue of a room, best priority score first. Only the staff member who runs the room
  // and admins may read it (anyone else gets a 404).
  room: (roomId: string, params: RoomWaitlistParams, signal?: AbortSignal) =>
    clientApi.getList<RoomWaitlistEntry>(`/room/${roomId}/waitlist`, params, signal),
}
