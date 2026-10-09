import { z } from 'zod'
import { type AvailabilitySlot, DayOfWeek, type UpdateSlotPayload } from '@/types'

// The add / edit availability form. Mirrors the backend's createSlotSchema / updateSlotSchema
// (staff.interface.ts): a weekday, and a start and end time in 24-hour "HH:mm" with the end after the
// start. Whether the slot overlaps another one is the backend's call (409).

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export const timeSchema = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .regex(TIME_PATTERN, `${label} must be 24h HH:mm, e.g. 09:30`)

export const slotFormSchema = z
  .object({
    dayOfWeek: z.enum(DayOfWeek, { error: 'Choose a day' }),
    startTime: timeSchema('Start time'),
    endTime: timeSchema('End time'),
  })
  // "HH:mm" strings compare correctly as plain strings.
  .refine(({ startTime, endTime }) => !startTime || !endTime || endTime > startTime, {
    error: 'End time must be after start time',
    path: ['endTime'],
  })

export type SlotFormInput = z.input<typeof slotFormSchema>

export const EMPTY_SLOT_FORM: SlotFormInput = {
  dayOfWeek: DayOfWeek.MONDAY,
  startTime: '',
  endTime: '',
}

// The form's starting values for editing a saved slot.
export function toSlotFormValues(slot: AvailabilitySlot): SlotFormInput {
  return { dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime }
}

// Only what changed, because the backend wants at least one field. Empty when nothing changed.
export function toSlotChanges(value: SlotFormInput, slot: AvailabilitySlot): UpdateSlotPayload {
  return {
    ...(value.dayOfWeek !== slot.dayOfWeek && { dayOfWeek: value.dayOfWeek }),
    ...(value.startTime !== slot.startTime && { startTime: value.startTime }),
    ...(value.endTime !== slot.endTime && { endTime: value.endTime }),
  }
}
