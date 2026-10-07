'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { RoomWaitlistParams } from '@/types'
import { waitlistApi } from './waitlist.api'
import { waitlistKeys } from './waitlist.keys'
import { WAITLIST_REFRESH_MS } from './waitlist.params'

// A room's pending queue. `live` asks again every 30 seconds while the page is open and visible, so a
// promotion shows up on its own. `quiet` is for a number on a card, where a failure is not worth a
// toast.
export function useRoomWaitlistQuery(
  roomId: string,
  params: RoomWaitlistParams,
  { live = false, quiet = false }: { live?: boolean; quiet?: boolean } = {},
) {
  return useQuery({
    queryKey: waitlistKeys.roomList(roomId, params),
    queryFn: ({ signal }) => waitlistApi.room(roomId, params, signal),
    // Keep showing the old rows while another session or page loads, so switching does not flash a
    // skeleton.
    placeholderData: keepPreviousData,
    refetchInterval: live ? WAITLIST_REFRESH_MS : false,
    meta: { skipGlobalError: quiet },
  })
}
