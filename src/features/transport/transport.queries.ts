'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  type CreateTransportPayload,
  type Paginated,
  type Transport,
  type TransportListParams,
  TransportStatus,
  type UpdateVehiclePayload,
  type Vehicle,
  type VehicleListParams,
  type VehiclePayload,
} from '@/types'
import { transportApi } from './transport.api'
import { transportKeys } from './transport.keys'

export function useTransportQuery(params: TransportListParams) {
  return useQuery({
    queryKey: transportKeys.list(params),
    queryFn: ({ signal }) => transportApi.list(params, signal),
    // Keep showing the old page while the next one loads, so paging does not flash a skeleton.
    placeholderData: keepPreviousData,
  })
}

// The ride of one booking (null if none). The booking's page prefetches it on the server.
export function useBookingRideQuery(bookingId: string) {
  return useQuery({
    queryKey: transportKeys.forBooking(bookingId),
    queryFn: ({ signal }) => transportApi.forBooking(bookingId, signal),
  })
}

// Only fetched while the ride form is open.
export function useVehiclesQuery(params: VehicleListParams, enabled: boolean) {
  return useQuery({
    queryKey: transportKeys.vehicles(params),
    queryFn: ({ signal }) => transportApi.vehicles(params, signal),
    enabled,
  })
}

// The ride form shows its own errors (field errors under the field, a message above the button, with
// a "Top up" link for an empty wallet), so the global toast is switched off.
export function useRequestRide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTransportPayload) => transportApi.create(payload),
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: transportKeys.all }),
  })
}

// The status filter of a cached ride list, read back from its query key
// (['transport', 'list', params]).
function statusOfList(key: readonly unknown[]): TransportStatus | undefined {
  const params = key[2]
  if (typeof params === 'object' && params !== null && 'status' in params) {
    return Object.values(TransportStatus).find((status) => status === params.status)
  }
  return undefined
}

// Optimistic: the ride shows as "Cancelled" at once (in "All" and on its booking's page) or leaves
// the "Requested" tab, and comes back if the backend refuses (409 when the driver has already
// started). The cancelled tab is left alone: it is refetched when the request settles.
export function useCancelRide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transportApi.cancel(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: transportKeys.all })
      const lists = queryClient.getQueriesData<Paginated<Transport>>({
        queryKey: transportKeys.lists(),
      })
      const rides = queryClient.getQueriesData<Transport | null>({
        queryKey: transportKeys.rides(),
      })

      for (const [key, page] of lists) {
        if (!page) continue
        const status = statusOfList(key)
        if (status === TransportStatus.CANCELLED) continue

        const items =
          status === undefined
            ? page.items.map((ride) =>
                ride.id === id ? { ...ride, status: TransportStatus.CANCELLED } : ride,
              )
            : page.items.filter((ride) => ride.id !== id)
        const removed = page.items.length - items.length
        queryClient.setQueryData<Paginated<Transport>>(key, {
          items,
          meta: { ...page.meta, total: Math.max(0, page.meta.total - removed) },
        })
      }
      for (const [key, ride] of rides) {
        if (ride?.id === id) {
          queryClient.setQueryData<Transport>(key, { ...ride, status: TransportStatus.CANCELLED })
        }
      }
      return { lists, rides }
    },
    onError: (_error, _id, context) => {
      for (const [key, data] of [...(context?.lists ?? []), ...(context?.rides ?? [])]) {
        queryClient.setQueryData(key, data)
      }
    },
    onSuccess: () => toast.success('Ride cancelled.'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: transportKeys.all }),
  })
}

// The driver's own vehicles. The server page has already prefetched the first load.
export function useMyVehiclesQuery(params: VehicleListParams) {
  return useQuery({
    queryKey: transportKeys.myVehicles(params),
    queryFn: ({ signal }) => transportApi.myVehicles(params, signal),
    // Keep showing the old page while the next one loads, so paging does not flash a skeleton.
    placeholderData: keepPreviousData,
  })
}

// Add and edit show their own errors (field errors under the field, a message above the button), so
// the global toast is switched off for them.

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: VehiclePayload) => transportApi.createVehicle(payload),
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: transportKeys.all }),
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVehiclePayload }) =>
      transportApi.updateVehicle(id, payload),
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: transportKeys.all }),
  })
}

// Optimistic: the vehicle leaves every cached list at once, and comes back if the backend refuses
// (409 "This vehicle has ride records and cannot be deleted", shown by the global toast).
export function useDeleteVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transportApi.deleteVehicle(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: transportKeys.myVehicleLists() })
      const previous = queryClient.getQueriesData<Paginated<Vehicle>>({
        queryKey: transportKeys.myVehicleLists(),
      })
      queryClient.setQueriesData<Paginated<Vehicle>>(
        { queryKey: transportKeys.myVehicleLists() },
        (page) =>
          page
            ? {
                items: page.items.filter((vehicle) => vehicle.id !== id),
                meta: { ...page.meta, total: Math.max(0, page.meta.total - 1) },
              }
            : page,
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      for (const [key, data] of context?.previous ?? []) queryClient.setQueryData(key, data)
    },
    onSuccess: () => toast.success('Vehicle removed.'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: transportKeys.all }),
  })
}
