import { clientApi } from '@/lib/api/client'
import type {
  CreateRoomPayload,
  Room,
  RoomListParams,
  RoomWithSeats,
  UpdateRoomPayload,
} from '@/types'
import { catalogueParams, collectAllRooms } from './room-catalogue'

// One function per endpoint, for the browser (through the BFF). The server page uses
// room.server.ts instead.
export const roomApi = {
  list: (params: RoomListParams, signal?: AbortSignal) =>
    clientApi.getList<RoomWithSeats>('/room', params, signal),
  // Every room (all pages), for the staff pages that keep the rooms they run.
  listAll: (signal?: AbortSignal) =>
    collectAllRooms((page) =>
      clientApi.getList<RoomWithSeats>('/room', catalogueParams(page), signal),
    ),
  // One room with its seats for `date`, or for its next session when `date` is left out.
  get: (id: string, date?: string, signal?: AbortSignal) =>
    clientApi.get<RoomWithSeats>(`/room/${id}`, { date }, signal),
  // The admin's room management. A room is created for a verified sitter who is free then.
  create: (payload: CreateRoomPayload) => clientApi.post<Room>('/room', payload),
  update: (id: string, payload: UpdateRoomPayload) => clientApi.patch<Room>(`/room/${id}`, payload),
  // Soft delete. 409 while the room has upcoming bookings or waitlist entries.
  remove: (id: string) => clientApi.delete(`/room/${id}`),
}
