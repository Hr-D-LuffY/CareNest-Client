'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { roomKeys } from '@/features/room/room.keys'
import type { CreateBookingPayload } from '@/types'
import { bookingApi } from './booking.api'
import { bookingKeys } from './booking.keys'

// The wizard shows its own errors (a message above the button, with a "Top up" link for an empty
// wallet), so the global toast is switched off. A booking or a waitlist spot changes the seats left
// in the room, so room data is refreshed too.
export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingApi.create(payload),
    meta: { skipGlobalError: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}
