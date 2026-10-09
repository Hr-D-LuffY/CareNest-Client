import { z } from 'zod'
import { timeSchema } from '@/features/staff/slot.schema'
import {
  ROOM_DEFAULT_PRICE_MULTIPLIER,
  ROOM_MAX_CAPACITY,
  ROOM_MAX_PRICE_MULTIPLIER,
  ROOM_MIN_CAPACITY,
} from '@/lib/constants'
import { type CreateRoomPayload, DayOfWeek, type Room, Tier, type UpdateRoomPayload } from '@/types'

// The admin's add / edit room form. Mirrors the backend's createRoomSchema / updateRoomSchema
// (room.interface.ts): a name, a tier, a whole-number capacity of 1 to 100, a weekday, a start and an
// end time (24-hour "HH:mm", the end after the start), a price multiplier above 0 and up to 99.99,
// and the sitter who runs it. Capacity and the multiplier are kept as the text typed and become
// numbers only in the payload. Whether the sitter is verified, free and available then is the
// backend's call, and its message is shown as it is.

// A whole or decimal number, at most two decimals (the backend stores the multiplier with two).
const MULTIPLIER_PATTERN = /^\d+(\.\d{1,2})?$/

export const roomFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    tier: z.enum(Tier, { error: 'Choose a care tier' }),
    capacity: z
      .string()
      .trim()
      .min(1, 'Capacity is required')
      .refine((value) => /^\d+$/.test(value), {
        error: 'Capacity must be a whole number',
        abort: true,
      })
      .refine((value) => Number(value) >= ROOM_MIN_CAPACITY, {
        error: `Capacity must be at least ${ROOM_MIN_CAPACITY}`,
        abort: true,
      })
      .refine(
        (value) => Number(value) <= ROOM_MAX_CAPACITY,
        `Capacity must be at most ${ROOM_MAX_CAPACITY}`,
      ),
    dayOfWeek: z.enum(DayOfWeek, { error: 'Choose a day' }),
    startTime: timeSchema('Start time'),
    endTime: timeSchema('End time'),
    priceMultiplier: z
      .string()
      .trim()
      .min(1, 'Price multiplier is required')
      .refine((value) => MULTIPLIER_PATTERN.test(value), {
        error: 'Price multiplier must be a number with at most 2 decimal places',
        abort: true,
      })
      .refine((value) => Number(value) > 0, {
        error: 'Price multiplier must be greater than 0',
        abort: true,
      })
      .refine(
        (value) => Number(value) <= ROOM_MAX_PRICE_MULTIPLIER,
        `Price multiplier must be at most ${ROOM_MAX_PRICE_MULTIPLIER}`,
      ),
    staffId: z.string().min(1, 'Choose who runs this room'),
  })
  // "HH:mm" strings compare correctly as plain strings.
  .refine(({ startTime, endTime }) => !startTime || !endTime || endTime > startTime, {
    error: 'End time must be after start time',
    path: ['endTime'],
  })

export type RoomFormInput = z.input<typeof roomFormSchema>

export const EMPTY_ROOM_FORM: RoomFormInput = {
  name: '',
  tier: Tier.DAILY,
  capacity: '',
  dayOfWeek: DayOfWeek.MONDAY,
  startTime: '',
  endTime: '',
  priceMultiplier: String(ROOM_DEFAULT_PRICE_MULTIPLIER),
  staffId: '',
}

// "1.50" -> "1.5", "1.00" -> "1": the saved multiplier as the admin would type it.
const multiplierText = (multiplier: string) => String(Number(multiplier))

// The form's starting values for editing a saved room.
export function toRoomFormValues(room: Room): RoomFormInput {
  return {
    name: room.name,
    tier: room.tier,
    capacity: String(room.capacity),
    dayOfWeek: room.dayOfWeek,
    startTime: room.startTime,
    endTime: room.endTime,
    priceMultiplier: multiplierText(room.priceMultiplier),
    staffId: room.staff.id,
  }
}

// Form values → request body for adding a room.
export function toCreateRoomPayload(values: RoomFormInput): CreateRoomPayload {
  return {
    name: values.name.trim(),
    tier: values.tier,
    capacity: Number(values.capacity),
    dayOfWeek: values.dayOfWeek,
    startTime: values.startTime,
    endTime: values.endTime,
    priceMultiplier: Number(values.priceMultiplier),
    staffId: values.staffId,
  }
}

// Only the fields that changed. The backend refuses a PATCH with no fields, and a schedule change is
// refused while the room has upcoming bookings, so an unchanged schedule must not be sent again.
// Empty when nothing changed.
export function toRoomChanges(values: RoomFormInput, room: Room): UpdateRoomPayload {
  const next = toCreateRoomPayload(values)
  return {
    ...(next.name !== room.name && { name: next.name }),
    ...(next.tier !== room.tier && { tier: next.tier }),
    ...(next.capacity !== room.capacity && { capacity: next.capacity }),
    ...(next.dayOfWeek !== room.dayOfWeek && { dayOfWeek: next.dayOfWeek }),
    ...(next.startTime !== room.startTime && { startTime: next.startTime }),
    ...(next.endTime !== room.endTime && { endTime: next.endTime }),
    ...(next.priceMultiplier !== Number(room.priceMultiplier) && {
      priceMultiplier: next.priceMultiplier,
    }),
    ...(next.staffId !== room.staff.id && { staffId: next.staffId }),
  }
}
