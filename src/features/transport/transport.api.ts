import { clientApi } from '@/lib/api/client'
import type {
  CreateTransportPayload,
  Transport,
  TransportListParams,
  Vehicle,
  VehicleListParams,
} from '@/types'
import { findRideForBooking, LOOKUP_PAGE_SIZE } from './transport.params'

// One function per endpoint, for the browser (through the BFF). Server pages use
// transport.server.ts instead.
export const transportApi = {
  list: (params: TransportListParams, signal?: AbortSignal) =>
    clientApi.getList<Transport>('/transport', params, signal),
  // The ride of one booking, or null when none was requested.
  forBooking: async (bookingId: string, signal?: AbortSignal) =>
    findRideForBooking(
      await clientApi.getList<Transport>('/transport', { limit: LOOKUP_PAGE_SIZE }, signal),
      bookingId,
    ),
  // Vehicles of verified drivers: the ones a ride can be booked with.
  vehicles: (params: VehicleListParams, signal?: AbortSignal) =>
    clientApi.getList<Vehicle>('/transport/vehicles', params, signal),
  create: (payload: CreateTransportPayload) => clientApi.post<Transport>('/transport', payload),
  // Only a ride the driver has not started can be cancelled (the backend answers 409 otherwise).
  cancel: (id: string) => clientApi.delete<Transport>(`/transport/${id}`),
}
