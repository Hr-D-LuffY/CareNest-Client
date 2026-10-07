import { z } from 'zod'
import { ADDRESS_MAX_LENGTH, ADDRESS_MIN_LENGTH } from '@/lib/constants'
import type { CreateTransportPayload } from '@/types'

// The "request a ride" form. Mirrors the backend's createTransportSchema (transport.interface.ts):
// a vehicle and two addresses of 5 to 255 characters. The booking id comes from the page, not the
// form.

const addressSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(ADDRESS_MIN_LENGTH, `${label} must be at least ${ADDRESS_MIN_LENGTH} characters`)
    .max(ADDRESS_MAX_LENGTH, `${label} must be at most ${ADDRESS_MAX_LENGTH} characters`)

export const rideFormSchema = z.object({
  vehicleId: z.string().min(1, 'Choose a vehicle'),
  pickupAddress: addressSchema('Pickup address'),
  dropoffAddress: addressSchema('Dropoff address'),
})

export type RideFormInput = z.input<typeof rideFormSchema>

export const EMPTY_RIDE_FORM: RideFormInput = {
  vehicleId: '',
  pickupAddress: '',
  dropoffAddress: '',
}

export function toRidePayload(bookingId: string, value: RideFormInput): CreateTransportPayload {
  return {
    bookingId,
    vehicleId: value.vehicleId,
    pickupAddress: value.pickupAddress.trim(),
    dropoffAddress: value.dropoffAddress.trim(),
  }
}
