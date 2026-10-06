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
