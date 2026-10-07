import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { RoomWaitlistEntry, RoomWaitlistParams } from '@/types'

export const getRoomWaitlistPage = (roomId: string, params: RoomWaitlistParams) =>
  serverApi.getList<RoomWaitlistEntry>(`/room/${roomId}/waitlist`, params)
