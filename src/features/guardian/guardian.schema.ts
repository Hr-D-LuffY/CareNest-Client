import { z } from 'zod'
import { photoSchema } from '@/lib/photo-schema'
import type { GuardianProfile, UpdateGuardianPayload } from '@/types'

// Mirrors the backend's updateGuardianSchema (guardian.interface.ts): name and phone cannot be
// blank, the address can be cleared. Email and role are not editable. The optional photo goes to
// a separate endpoint after the details are saved.

const requiredText = (label: string) => z.string().trim().min(1, `${label} is required`)

export const profileFormSchema = z.object({
  name: requiredText('Name'),
  phone: requiredText('Phone'),
  // Blank is fine: it clears the address (sent as null).
  address: z.string().trim(),
  photo: photoSchema,
})

export type ProfileFormInput = z.input<typeof profileFormSchema>

// The form's starting values: what is saved now.
export function toProfileFormValues(profile: GuardianProfile): ProfileFormInput {
  return {
    name: profile.name,
    phone: profile.guardianProfile.phone,
    address: profile.guardianProfile.address ?? '',
    photo: null,
  }
}

// Only the fields that changed. The backend refuses a PATCH with no fields, and sending the rest
// again would only make noise in its audit trail.
export function toProfilePayload(
  values: ProfileFormInput,
  profile: GuardianProfile,
): UpdateGuardianPayload {
  const payload: UpdateGuardianPayload = {}
  const name = values.name.trim()
  const phone = values.phone.trim()
  const address = values.address.trim()

  if (name !== profile.name) payload.name = name
  if (phone !== profile.guardianProfile.phone) payload.phone = phone
  if (address !== (profile.guardianProfile.address ?? '')) payload.address = address || null
  return payload
}

// Is there anything to save: a changed detail, or a new photo.
export function hasProfileChanges(values: ProfileFormInput, profile: GuardianProfile): boolean {
  return values.photo !== null || Object.keys(toProfilePayload(values, profile)).length > 0
}
