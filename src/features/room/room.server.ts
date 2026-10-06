import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { RoomListParams, RoomWithSeats } from '@/types'

export const getRoomsPage = (params: RoomListParams) =>
  serverApi.getList<RoomWithSeats>('/room', params)
