import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { RoomListParams, RoomWithSeats } from '@/types'
import { catalogueParams, collectAllRooms } from './room-catalogue'

export const getRoomsPage = (params: RoomListParams) =>
  serverApi.getList<RoomWithSeats>('/room', params)

// One room with its seats for `date` (a "YYYY-MM-DD" session date), or for its next session.
export const getRoom = (id: string, date?: string) =>
  serverApi.get<RoomWithSeats>(`/room/${id}`, { date })

// Every room (all pages): see collectAllRooms.
export const getAllRooms = () =>
  collectAllRooms((page) => serverApi.getList<RoomWithSeats>('/room', catalogueParams(page)))
