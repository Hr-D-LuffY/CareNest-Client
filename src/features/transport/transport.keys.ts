import type { TransportListParams, VehicleListParams } from '@/types'

// Query keys for the transport feature. Kept out of transport.queries.ts ("use client") so server
// pages can use the same keys. Requesting or cancelling a ride invalidates transportKeys.all.
export const transportKeys = {
  all: ['transport'] as const,
  lists: () => [...transportKeys.all, 'list'] as const,
  list: (params: TransportListParams) => [...transportKeys.lists(), params] as const,
  // The ride (or null) that belongs to one booking.
  rides: () => [...transportKeys.all, 'booking'] as const,
  forBooking: (bookingId: string) => [...transportKeys.rides(), bookingId] as const,
  vehicles: (params: VehicleListParams) => [...transportKeys.all, 'vehicles', params] as const,
}
