'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { roomKeys } from '@/features/room/room.keys'
import { transportKeys } from '@/features/transport/transport.keys'
import {
  type Booking,
  type BookingListParams,
  BookingStatus,
  type CreateBookingPayload,
  type Paginated,
  type RoomBookingParams,
  type WaitlistListParams,
} from '@/types'
import { bookingApi } from './booking.api'
import { bookingKeys } from './booking.keys'
import { ROOM_ROSTER_REFRESH_MS } from './room-roster.params'

export function useBookingsQuery(params: BookingListParams) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: ({ signal }) => bookingApi.list(params, signal),
    // Keep showing the old page while the next one loads, so paging does not flash a skeleton.
    placeholderData: keepPreviousData,
  })
}

// One booking, for its detail page. The server page has already loaded it.
export function useBookingQuery(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: ({ signal }) => bookingApi.get(id, signal),
  })
}

// Who is booked into one session of a room. Asks again every 30 seconds while the page is open, so a
// cancellation or a check-in shows up on its own.
export function useRoomBookingsQuery(roomId: string, params: RoomBookingParams) {
  return useQuery({
    queryKey: bookingKeys.roomRoster(roomId, params),
    queryFn: ({ signal }) => bookingApi.room(roomId, params, signal),
    placeholderData: keepPreviousData,
    refetchInterval: ROOM_ROSTER_REFRESH_MS,
  })
}

// Only fetched while the Waitlisted tab is open.
export function useWaitlistQuery(params: WaitlistListParams, enabled: boolean) {
  return useQuery({
    queryKey: bookingKeys.waitlist(params),
    queryFn: ({ signal }) => bookingApi.waitlist(params, signal),
    placeholderData: keepPreviousData,
    enabled,
  })
}

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

// The status filter of a cached booking list, read back from its query key
// (['bookings', 'list', params]).
function statusOfList(key: readonly unknown[]): BookingStatus | undefined {
  const params = key[2]
  if (typeof params === 'object' && params !== null && 'status' in params) {
    return Object.values(BookingStatus).find((status) => status === params.status)
  }
  return undefined
}

// Optimistic: the booking leaves "Confirmed" and shows as "Cancelled" in "All" at once, and comes
// back if the backend refuses (409 "This session has already started or passed…", shown by the
// global toast). The cancelled tab is left alone: it is refetched when the request settles.
export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookingApi.cancel(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: bookingKeys.lists() })
      const previous = queryClient.getQueriesData<Paginated<Booking>>({
        queryKey: bookingKeys.lists(),
      })

      for (const [key, page] of previous) {
        if (!page) continue
        const status = statusOfList(key)
        if (status === BookingStatus.CANCELLED) continue

        const items =
          status === undefined
            ? page.items.map((booking) =>
                booking.id === id ? { ...booking, status: BookingStatus.CANCELLED } : booking,
              )
            : page.items.filter((booking) => booking.id !== id)
        const removed = page.items.length - items.length
        queryClient.setQueryData<Paginated<Booking>>(key, {
          items,
          meta: { ...page.meta, total: Math.max(0, page.meta.total - removed) },
        })
      }
      return { previous }
    },
    onError: (_error, _id, context) => {
      for (const [key, data] of context?.previous ?? []) queryClient.setQueryData(key, data)
    },
    onSuccess: () =>
      toast.success('Booking cancelled. If a child was waiting for this seat, they were promoted.'),
    // The seat is free again and the waitlist may have moved, so everything that shows either is
    // refetched. The backend also cancels a ride that was only requested for this booking.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
      queryClient.invalidateQueries({ queryKey: transportKeys.all })
    },
  })
}
