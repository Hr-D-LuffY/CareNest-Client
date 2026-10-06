import { clientApi } from '@/lib/api/client'
import type { RoomListParams, RoomWithSeats } from '@/types'

// One function per endpoint, for the browser (through the BFF). The server page uses
// room.server.ts instead.
export const roomApi = {
  list: (params: RoomListParams, signal?: AbortSignal) =>
    clientApi.getList<RoomWithSeats>('/room', params, signal),
  // One room with its seats for `date`, or for its next session when `date` is left out.
  get: (id: string, date?: string, signal?: AbortSignal) =>
    clientApi.get<RoomWithSeats>(`/room/${id}`, { date }, signal),
}
