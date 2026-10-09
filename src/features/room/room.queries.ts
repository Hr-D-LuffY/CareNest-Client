'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  CreateRoomPayload,
  Paginated,
  RoomListParams,
  RoomWithSeats,
  UpdateRoomPayload,
} from '@/types'
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

// Creating and editing show their own errors (field errors under the field, a message above the
// button: "The staff member is not available on MONDAY…", "Cannot change the schedule while the
// room has upcoming bookings"), so the global toast is switched off for them. A room change moves
// seats, prices and who runs what, so every room query is refreshed.

export function useCreateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRoomPayload) => roomApi.create(payload),
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roomKeys.all }),
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomPayload }) =>
      roomApi.update(id, payload),
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roomKeys.all }),
  })
}

// Optimistic: the room leaves every cached list at once, and comes back if the backend refuses
// (409 "Cannot delete a room with upcoming bookings or waitlist entries. Cancel them first", shown
// by the global toast). A room's detail page is left alone, so it does not refetch a room that is
// gone.
export function useDeleteRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (room: Pick<RoomWithSeats, 'id' | 'name'>) => roomApi.remove(room.id),
    onMutate: async (room) => {
      await queryClient.cancelQueries({ queryKey: roomKeys.lists() })
      const previous = queryClient.getQueriesData<Paginated<RoomWithSeats>>({
        queryKey: roomKeys.lists(),
      })
      queryClient.setQueriesData<Paginated<RoomWithSeats>>(
        { queryKey: roomKeys.lists() },
        (page) =>
          page
            ? {
                items: page.items.filter((item) => item.id !== room.id),
                meta: { ...page.meta, total: Math.max(0, page.meta.total - 1) },
              }
            : page,
      )
      return { previous }
    },
    onError: (_error, _room, context) => {
      for (const [key, data] of context?.previous ?? []) queryClient.setQueryData(key, data)
    },
    onSuccess: (_result, room) => toast.success(`${room.name} was deleted.`),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
      queryClient.invalidateQueries({ queryKey: roomKeys.catalogue() })
    },
  })
}
