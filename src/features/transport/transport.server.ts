import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { Transport, TransportListParams, Vehicle, VehicleListParams } from '@/types'
import { findRideForBooking, LOOKUP_PAGE_SIZE } from './transport.params'

export const getTransportPage = (params: TransportListParams) =>
  serverApi.getList<Transport>('/transport', params)

// The ride of one booking, or null when none was requested.
export async function getBookingRide(bookingId: string) {
  return findRideForBooking(
    await serverApi.getList<Transport>('/transport', { limit: LOOKUP_PAGE_SIZE }),
    bookingId,
  )
}

export const getMyVehiclesPage = (params: VehicleListParams) =>
  serverApi.getList<Vehicle>('/transport/vehicles/me', params)
