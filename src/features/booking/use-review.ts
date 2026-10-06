'use client'

import { useChildrenQuery } from '@/features/child/child.queries'
import { useGuardianProfile } from '@/features/guardian/guardian.queries'
import { getHourlyPrice } from '@/features/room/room-price'
import { calculateFare, hoursBetween } from '@/lib/fare'
import { WIZARD_CHILD_PARAMS } from './booking.params'
import type { BookingFormInput } from './booking.schema'
import { useSelectedRoom } from './use-selected-room'

// Everything the review step shows and checks, from the picks so far: the child, the room and its
// seats for the date, the estimated fee and the wallet balance. The wizard calls this too, to know
// whether "Confirm" may be pressed. The backend still decides; this only avoids a request that is
// sure to fail (an empty wallet).
export function useReview(values: BookingFormInput) {
  const selected = useSelectedRoom(values.roomId, values.sessionDate)
  const children = useChildrenQuery(WIZARD_CHILD_PARAMS)
  const profile = useGuardianProfile()

  const child = children.data?.items.find((item) => item.id === values.childId)
  const { room } = selected
  const hourlyRate = room?.staff.hourlyRate ?? null

  // The fee for the whole session, worked out exactly like the backend (hours × rate × multiplier).
  // Null while the room has no hourly rate; the backend refuses to book such a room.
  const estimatedFee =
    room && hourlyRate
      ? calculateFare(hoursBetween(room.startTime, room.endTime), hourlyRate, room.priceMultiplier)
      : null
  const balance = profile.data?.guardianProfile.walletBalance

  return {
    // The room lookups, shared with step 2 so both read the same cached answer.
    selected,
    child,
    room,
    isFull: room !== undefined && room.seatsLeft === 0,
    hourlyPrice: room ? getHourlyPrice(room) : null,
    estimatedFee,
    balance,
    // Numbers are only compared here, never added.
    insufficientBalance:
      estimatedFee !== null && balance !== undefined && Number(balance) < Number(estimatedFee),
    isLoading: selected.isPending || children.isPending || profile.isPending,
    hasRate: room === undefined || hourlyRate !== null,
    // Everything needed to place the booking has loaded.
    isReady: child !== undefined && room !== undefined && estimatedFee !== null,
  }
}

export type Review = ReturnType<typeof useReview>
