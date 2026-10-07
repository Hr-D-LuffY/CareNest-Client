'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { staffKeys } from '@/features/staff/staff.keys'
import type { CreateRatingPayload } from '@/types'
import { ratingApi } from './rating.api'
import { ratingKeys } from './rating.keys'

// Has the guardian already rated this staff member for this booking? Pass `enabled: false` while the
// staff id is not known yet.
export function useBookingRatingQuery(staffId: string, bookingId: string, enabled = true) {
  return useQuery({
    queryKey: ratingKeys.forBooking(staffId, bookingId),
    queryFn: ({ signal }) => ratingApi.forBooking(staffId, bookingId, signal),
    enabled: enabled && staffId !== '',
  })
}

// The rating form shows its own errors (a message above the button), so the global toast is
// switched off. The new rating changes the staff member's average, which the room page shows, so
// the staff reviews are refetched too.
export function useCreateRating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRatingPayload) => ratingApi.create(payload),
    meta: { skipGlobalError: true },
    onSuccess: (rating) => {
      queryClient.setQueryData(ratingKeys.forBooking(rating.staffId, rating.bookingId), rating)
      queryClient.invalidateQueries({ queryKey: staffKeys.all })
    },
  })
}
