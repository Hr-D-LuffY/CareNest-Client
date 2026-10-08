import { z } from 'zod'
import { passwordSchema } from '@/features/auth/auth.schema'
import { experienceField } from '@/features/staff/staff.schema'
import { MAX_STAFF_RATE } from '@/lib/constants'
import {
  type CreateStaffPayload,
  type StaffProfile,
  StaffType,
  type UpdateStaffPayload,
} from '@/types'

// The admin's staff forms. They mirror the backend's createStaffSchema / updateStaffSchema
// (admin.interface.ts): a name, an email, a password of 8 to 72 characters, a staff type, whole
// years of experience, an optional bio, and the rate(s) the type needs. A sitter needs an hourly
// rate, a driver a per-minute rate and BOTH needs both. Rates and experience are kept as the text
// typed and become numbers only in the payload.

// What each staff type is paid by, which is why the rate(s) it needs differ.
export const needsHourlyRate = (type: StaffType) => type !== StaffType.DRIVER
export const needsPerMinuteRate = (type: StaffType) => type !== StaffType.SITTER

// A whole or decimal number, at most two decimals (the backend stores a rate with two).
const RATE_PATTERN = /^\d+(\.\d{1,2})?$/

function rateProblem(text: string, label: string): string | null {
  const value = text.trim()
  if (!value) return `${label} is required`
  if (!RATE_PATTERN.test(value)) return `${label} must be a number with at most 2 decimal places`
  const rate = Number(value)
  if (rate <= 0) return 'Rate must be greater than 0'
  if (rate > MAX_STAFF_RATE) return `Rate must be at most ${MAX_STAFF_RATE}`
  return null
}

type RateValues = { staffType: StaffType; hourlyRate: string; perMinuteRate: string }

// Only the rate(s) the chosen type needs are checked: the other field is hidden in the form.
function rateIssues({ staffType, hourlyRate, perMinuteRate }: RateValues) {
  const issues: { path: string; message: string }[] = []
  if (needsHourlyRate(staffType)) {
    const message = rateProblem(hourlyRate, 'Hourly rate')
    if (message) issues.push({ path: 'hourlyRate', message })
  }
  if (needsPerMinuteRate(staffType)) {
    const message = rateProblem(perMinuteRate, 'Per-minute rate')
    if (message) issues.push({ path: 'perMinuteRate', message })
  }
  return issues
}

function checkRates(values: RateValues, ctx: z.core.$RefinementCtx) {
  for (const { path, message } of rateIssues(values)) {
    ctx.addIssue({ code: 'custom', message, path: [path] })
  }
}

const nameField = z.string().trim().min(1, 'Name is required')

// Step 2 (and the edit form): what the person does, how they are paid and how experienced they are.
const detailsShape = {
  staffType: z.enum(StaffType, { error: 'Choose what this person will do' }),
  experience: experienceField,
  // Blank is fine: the bio is left out (create) or cleared (edit).
  bio: z.string().trim(),
  hourlyRate: z.string(),
  perMinuteRate: z.string(),
}

// Step 1: the login.
const accountShape = {
  name: nameField,
  email: z.email('A valid email is required').toLowerCase(),
  password: passwordSchema,
}

const accountStep = z.object(accountShape)
const detailsStep = z.object(detailsShape).superRefine(checkRates)

// One schema per step, merged for the whole create-staff form.
export const staffFormSchema = z
  .object({ ...accountShape, ...detailsShape })
  .superRefine(checkRates)

export type StaffFormInput = z.input<typeof staffFormSchema>

export const EMPTY_STAFF_FORM: StaffFormInput = {
  name: '',
  email: '',
  password: '',
  staffType: StaffType.SITTER,
  experience: '0',
  bio: '',
  hourlyRate: '',
  perMinuteRate: '',
}

// Which fields each step owns, and the schema that checks only those.
export const STAFF_STEP_FIELDS = {
  1: ['name', 'email', 'password'],
  2: ['staffType', 'experience', 'bio', 'hourlyRate', 'perMinuteRate'],
  3: ['name', 'email', 'password', 'staffType', 'experience', 'bio', 'hourlyRate', 'perMinuteRate'],
} as const

export const STAFF_STEP_SCHEMAS = { 1: accountStep, 2: detailsStep, 3: staffFormSchema } as const

// The rates are sent only for the type that uses them, so a sitter never carries a stale per-minute
// rate typed before switching the type.
function ratePayload(values: RateValues) {
  return {
    ...(needsHourlyRate(values.staffType) && { hourlyRate: Number(values.hourlyRate.trim()) }),
    ...(needsPerMinuteRate(values.staffType) && {
      perMinuteRate: Number(values.perMinuteRate.trim()),
    }),
  }
}

export function toCreateStaffPayload(values: StaffFormInput): CreateStaffPayload {
  const bio = values.bio.trim()
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password,
    staffType: values.staffType,
    experience: Number(values.experience),
    ...(bio && { bio }),
    ...ratePayload(values),
  }
}

// The edit dialog. The email and verification cannot be changed here.
export const staffEditSchema = z
  .object({ name: nameField, ...detailsShape })
  .superRefine(checkRates)

export type StaffEditInput = z.input<typeof staffEditSchema>

// "150.00" -> "150", "2.50" -> "2.5": the saved rate as the admin would type it.
const rateText = (rate: string | null) => (rate === null ? '' : String(Number(rate)))

export function toStaffEditValues(staff: StaffProfile): StaffEditInput {
  return {
    name: staff.user.name,
    staffType: staff.staffType,
    experience: String(staff.experience),
    bio: staff.bio ?? '',
    hourlyRate: rateText(staff.hourlyRate),
    perMinuteRate: rateText(staff.perMinuteRate),
  }
}

// A rate that changed, as the value to send: a number, or null to clear a rate the new type no
// longer uses (otherwise a driver would keep showing a care rate). Undefined when it did not change.
function rateChange(
  needed: boolean,
  typed: string,
  saved: string | null,
): number | null | undefined {
  if (!needed) return saved === null ? undefined : null
  const next = Number(typed.trim())
  return saved !== null && Number(saved) === next ? undefined : next
}

// Only the fields that changed. The backend refuses a PATCH with no fields, and sending the rest
// again would only make noise in its audit trail. Empty when nothing changed.
export function toStaffChanges(values: StaffEditInput, staff: StaffProfile): UpdateStaffPayload {
  const name = values.name.trim()
  const bio = values.bio.trim()
  const experience = Number(values.experience)
  const hourlyRate = rateChange(
    needsHourlyRate(values.staffType),
    values.hourlyRate,
    staff.hourlyRate,
  )
  const perMinuteRate = rateChange(
    needsPerMinuteRate(values.staffType),
    values.perMinuteRate,
    staff.perMinuteRate,
  )

  return {
    ...(name !== staff.user.name && { name }),
    ...(values.staffType !== staff.staffType && { staffType: values.staffType }),
    ...(experience !== staff.experience && { experience }),
    // A bio cannot be blank on the backend, so clearing it is sent as null.
    ...(bio !== (staff.bio ?? '') && { bio: bio || null }),
    ...(hourlyRate !== undefined && { hourlyRate }),
    ...(perMinuteRate !== undefined && { perMinuteRate }),
  }
}
