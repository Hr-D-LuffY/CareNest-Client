'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { RoomListParams } from '@/types'
import { roomApi } from './room.api'
import { roomKeys } from './room.keys'

export function useRoomsQuery(params: RoomListParams) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: ({ signal }) => roomApi.list(params, signal),
    // Keep showing the old rooms while a filter or page loads, so changing one does not flash a
    // skeleton.
    placeholderData: keepPreviousData,
  })
}

// One room with its seats for a session date, or for its next session without a date. Pass
// `enabled: false` while there is nothing to look up yet.
export function useRoomQuery(id: string, date: string | undefined, enabled = true) {
  return useQuery({
    queryKey: roomKeys.detail(id, date),
    queryFn: ({ signal }) => roomApi.get(id, date, signal),
    enabled: enabled && id !== '',
  })
}
