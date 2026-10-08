import { z } from 'zod'
import { MAX_EXPERIENCE_YEARS } from '@/lib/constants'
import { photoSchema } from '@/lib/photo-schema'
import type { StaffProfile, UpdateStaffProfilePayload } from '@/types'

// Mirrors the backend's updateMyStaffSchema (staff.interface.ts): staff edit only their name, bio
// and years of experience. Type, rates and verification are set by an admin. The experience is kept
// as the text typed and becomes a number only in the payload.

// Years of experience, kept as the text typed. The admin's staff forms use it too.
export const experienceField = z
  .string()
  .trim()
  .min(1, 'Experience is required')
  .refine((value) => /^\d+$/.test(value), {
    error: 'Experience must be a whole number of years',
    abort: true,
  })
  .refine(
    (value) => Number(value) <= MAX_EXPERIENCE_YEARS,
    `Experience must be at most ${MAX_EXPERIENCE_YEARS} years`,
  )

export const staffProfileFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  // Blank is fine: it clears the bio (sent as null, because the backend refuses an empty string).
  bio: z.string().trim(),
  experience: experienceField,
  // Optional. It goes to a separate endpoint after the details are saved.
  photo: photoSchema,
})

export type StaffProfileFormInput = z.input<typeof staffProfileFormSchema>

// The form's starting values: what is saved now.
export function toStaffProfileValues(profile: StaffProfile): StaffProfileFormInput {
  return {
    name: profile.user.name,
    bio: profile.bio ?? '',
    experience: String(profile.experience),
    photo: null,
  }
}

// Only the fields that changed. The backend refuses a PATCH with no fields, and sending the rest
// again would only make noise in its audit trail.
export function toStaffProfilePayload(
  values: StaffProfileFormInput,
  profile: StaffProfile,
): UpdateStaffProfilePayload {
  const payload: UpdateStaffProfilePayload = {}
  const name = values.name.trim()
  const bio = values.bio.trim()
  const experience = Number(values.experience)

  if (name !== profile.user.name) payload.name = name
  if (bio !== (profile.bio ?? '')) payload.bio = bio || null
  if (experience !== profile.experience) payload.experience = experience
  return payload
}

export function hasStaffProfileChanges(
  values: StaffProfileFormInput,
  profile: StaffProfile,
): boolean {
  return values.photo !== null || Object.keys(toStaffProfilePayload(values, profile)).length > 0
}
