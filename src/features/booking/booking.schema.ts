import { z } from 'zod'
import { parseSessionDateParam } from '@/features/room/room.params'
import type { CreateBookingPayload } from '@/types'

// The booking wizard's values. Mirrors the backend's createBookingSchema (booking.interface.ts):
// a child id, a room id and a session date. One schema per step, merged for the whole form, so each
// step can be checked on its own before "Next".

const childStep = z.object({
  childId: z.string().min(1, 'Choose the child you are booking for'),
})

const roomStep = z.object({
  roomId: z.string().min(1, 'Choose a care room'),
  sessionDate: z
    .string()
    .min(1, 'Pick a session date')
    .refine(
      (value) => parseSessionDateParam(value) !== undefined,
      'Pick a session date that has not passed',
    ),
})

export const bookingFormSchema = z.object({ ...childStep.shape, ...roomStep.shape })

export type BookingFormInput = z.infer<typeof bookingFormSchema>

export const EMPTY_BOOKING_FORM: BookingFormInput = { childId: '', roomId: '', sessionDate: '' }

// Which fields each step owns, and the schema that checks only those.
export const STEP_FIELDS = {
  1: ['childId'],
  2: ['roomId', 'sessionDate'],
  3: ['childId', 'roomId', 'sessionDate'],
} as const

export const STEP_SCHEMAS = { 1: childStep, 2: roomStep, 3: bookingFormSchema } as const

export function toBookingPayload(value: BookingFormInput): CreateBookingPayload {
  return { childId: value.childId, roomId: value.roomId, sessionDate: value.sessionDate }
}
