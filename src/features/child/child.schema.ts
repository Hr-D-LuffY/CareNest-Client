import { z } from 'zod'
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/lib/constants'
import { todayIso } from '@/lib/format'
import { type Child, type ChildPayload, Tier } from '@/types'

// Mirrors the backend's createChildSchema / updateChildSchema (child.interface.ts), plus the
// optional photo, which goes to a separate endpoint after the child is saved.

const requiredText = (label: string) => z.string().trim().min(1, `${label} is required`)

const DATE_ERROR = 'A valid date of birth is required'

// True for a real calendar day in "YYYY-MM-DD" form, false for anything else (an empty or half-typed
// value, or 2026-02-31). Must never throw: this runs on every keystroke, and a throw makes the
// validator fall back to async, which TanStack Form rejects.
function isCalendarDay(value: string) {
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

// "YYYY-MM-DD" that is a real calendar day and not in the future.
const dateOfBirth = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, DATE_ERROR)
  .refine(isCalendarDay, DATE_ERROR)
  .refine((value) => value <= todayIso(), 'Date of birth cannot be in the future')

const photo = z
  .instanceof(File)
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.some((type) => type === file.type),
    'Photo must be a JPEG, PNG or WEBP image',
  )
  .refine((file) => file.size <= MAX_UPLOAD_BYTES, 'Photo must be 5 MB or smaller')
  .nullable()

export const childFormSchema = z.object({
  name: requiredText('Name'),
  dateOfBirth,
  tier: z.enum(Tier, { error: `Tier must be one of: ${Object.values(Tier).join(', ')}` }),
  // Blank is fine: it is left out on create and sent as null on update.
  allergies: z.string().trim(),
  conditions: z.string().trim(),
  emergencyContactName: requiredText('Emergency contact name'),
  emergencyContactPhone: requiredText('Emergency contact phone'),
  photo,
})

export type ChildFormInput = z.input<typeof childFormSchema>

export const EMPTY_CHILD_FORM: ChildFormInput = {
  name: '',
  dateOfBirth: '',
  tier: Tier.DAILY,
  allergies: '',
  conditions: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  photo: null,
}

// The form's starting values for editing a saved child.
export function toChildFormValues(child: Child): ChildFormInput {
  return {
    name: child.name,
    dateOfBirth: child.dateOfBirth.slice(0, 10),
    tier: child.tier,
    allergies: child.allergies ?? '',
    conditions: child.conditions ?? '',
    emergencyContactName: child.emergencyContactName,
    emergencyContactPhone: child.emergencyContactPhone,
    photo: null,
  }
}

// Form values → request body. The backend rejects an empty string for the optional fields, so on
// create they are left out, and on update a blank means "clear it" and is sent as null.
export function toChildPayload(values: ChildFormInput, mode: 'create' | 'update'): ChildPayload {
  const { photo: _photo, allergies, conditions, ...rest } = values
  const optional = (text: string) => text.trim() || (mode === 'update' ? null : undefined)
  return { ...rest, allergies: optional(allergies), conditions: optional(conditions) }
}
