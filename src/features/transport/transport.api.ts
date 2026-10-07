import { clientApi } from '@/lib/api/client'
import type {
  CreateTransportPayload,
  EndedTransport,
  Transport,
  TransportListParams,
  UpdateVehiclePayload,
  Vehicle,
  VehicleListParams,
  VehiclePayload,
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
  // The signed-in driver's own vehicles.
  myVehicles: (params: VehicleListParams, signal?: AbortSignal) =>
    clientApi.getList<Vehicle>('/transport/vehicles/me', params, signal),
  createVehicle: (payload: VehiclePayload) =>
    clientApi.post<Vehicle>('/transport/vehicles', payload),
  updateVehicle: (id: string, payload: UpdateVehiclePayload) =>
    clientApi.patch<Vehicle>(`/transport/vehicles/${id}`, payload),
  // A vehicle with any ride history stays (the backend answers 409).
  deleteVehicle: (id: string) => clientApi.delete(`/transport/vehicles/${id}`),
  // The assigned driver only. A trip starts on the session date, from REQUESTED.
  startTrip: (id: string) => clientApi.post<Transport>(`/transport/${id}/start`),
  // Prices the trip (base fare + minutes x the driver's rate) and charges the guardian's wallet.
  endTrip: (id: string) => clientApi.post<EndedTransport>(`/transport/${id}/end`),
  create: (payload: CreateTransportPayload) => clientApi.post<Transport>('/transport', payload),
  // Only a ride the driver has not started can be cancelled (the backend answers 409 otherwise).
  cancel: (id: string) => clientApi.delete<Transport>(`/transport/${id}`),
}
