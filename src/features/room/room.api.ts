import { clientApi } from '@/lib/api/client'
import type { RoomListParams, RoomWithSeats } from '@/types'

// One function per endpoint, for the browser (through the BFF). The server page uses
// room.server.ts instead.
export const roomApi = {
  list: (params: RoomListParams, signal?: AbortSignal) =>
    clientApi.getList<RoomWithSeats>('/room', params, signal),
}
