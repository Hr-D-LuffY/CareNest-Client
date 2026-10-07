import { z } from 'zod'
import {
  PLATE_NUMBER_MAX_LENGTH,
  PLATE_NUMBER_MIN_LENGTH,
  VEHICLE_MAX_CAPACITY,
  VEHICLE_MIN_CAPACITY,
} from '@/lib/constants'
import { type UpdateVehiclePayload, type Vehicle, type VehiclePayload, VehicleType } from '@/types'

// The add / edit vehicle form. Mirrors the backend's createVehicleSchema / updateVehicleSchema
// (transport.interface.ts): a plate of 3 to 20 characters (the backend trims and upper-cases it), a
// whole-number capacity of 1 to 60, and a vehicle type. The capacity is kept as the text the driver
// typed and becomes a number only in the payload.

export const vehicleFormSchema = z.object({
  plateNumber: z
    .string()
    .trim()
    .min(
      PLATE_NUMBER_MIN_LENGTH,
      `Plate number must be at least ${PLATE_NUMBER_MIN_LENGTH} characters`,
    )
    .max(
      PLATE_NUMBER_MAX_LENGTH,
      `Plate number must be at most ${PLATE_NUMBER_MAX_LENGTH} characters`,
    ),
  vehicleType: z.enum(VehicleType, { error: 'Choose a vehicle type' }),
  capacity: z
    .string()
    .trim()
    .min(1, 'Capacity is required')
    .refine((value) => /^\d+$/.test(value), {
      error: 'Capacity must be a whole number',
      abort: true,
    })
    .refine((value) => Number(value) >= VEHICLE_MIN_CAPACITY, {
      error: `Capacity must be at least ${VEHICLE_MIN_CAPACITY}`,
      abort: true,
    })
    .refine(
      (value) => Number(value) <= VEHICLE_MAX_CAPACITY,
      `Capacity must be at most ${VEHICLE_MAX_CAPACITY}`,
    ),
})

export type VehicleFormInput = z.input<typeof vehicleFormSchema>

export const EMPTY_VEHICLE_FORM: VehicleFormInput = {
  plateNumber: '',
  vehicleType: VehicleType.CAR,
  capacity: '',
}

// The form's starting values for editing a saved vehicle.
export function toVehicleFormValues(vehicle: Vehicle): VehicleFormInput {
  return {
    plateNumber: vehicle.plateNumber,
    vehicleType: vehicle.vehicleType,
    capacity: String(vehicle.capacity),
  }
}

// Form values → request body for adding a vehicle.
export function toVehiclePayload(value: VehicleFormInput): VehiclePayload {
  return {
    plateNumber: value.plateNumber.trim().toUpperCase(),
    vehicleType: value.vehicleType,
    capacity: Number(value.capacity),
  }
}

// Form values → request body for editing: only what changed, because the backend wants at least one
// field and there is no point sending the rest. Empty when nothing changed.
export function toVehicleChanges(value: VehicleFormInput, vehicle: Vehicle): UpdateVehiclePayload {
  const next = toVehiclePayload(value)
  return {
    ...(next.plateNumber !== vehicle.plateNumber && { plateNumber: next.plateNumber }),
    ...(next.vehicleType !== vehicle.vehicleType && { vehicleType: next.vehicleType }),
    ...(next.capacity !== vehicle.capacity && { capacity: next.capacity }),
  }
}
