import type { TransportStatus, VehicleType } from './enums'
import type { TripLog } from './staff'

export type Vehicle = {
  id: string
  plateNumber: string
  capacity: number
  vehicleType: VehicleType
  createdAt: string
  updatedAt: string
  driver: {
    id: string
    perMinuteRate: string
    user: { name: string }
  }
}

export type Transport = {
  id: string
  status: TransportStatus
  pickupAddress: string
  dropoffAddress: string
  baseFare: string
  createdAt: string
  vehicle: {
    id: string
    plateNumber: string
    vehicleType: VehicleType
  }
  driver: {
    id: string
    user: { name: string }
  }
  tripLog: TripLog | null
  booking: {
    id: string
    sessionDate: string
    child: { id: string; name: string }
    room: { id: string; name: string; startTime: string; endTime: string }
  }
}

// POST /transport/:id/end also reports whether the fare was charged to the wallet.
export type EndedTransport = Transport & {
  charged: boolean
}

// Query params of GET /transport. `status` filters; paging is 1-based.
export type TransportListParams = {
  page: number
  limit: number
  status?: TransportStatus
}

// Query params of GET /transport/vehicles (the vehicles a guardian can book a ride with).
export type VehicleListParams = {
  page: number
  limit: number
  vehicleType?: VehicleType
}

// POST /transport body. One ride per booking.
export type CreateTransportPayload = {
  bookingId: string
  vehicleId: string
  pickupAddress: string
  dropoffAddress: string
}
