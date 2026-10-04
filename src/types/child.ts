import type { Tier } from './enums'

export type Child = {
  id: string
  name: string
  dateOfBirth: string
  tier: Tier
  allergies: string | null
  conditions: string | null
  emergencyContactName: string
  emergencyContactPhone: string
  profilePhoto: string | null
  createdAt: string
  updatedAt: string
}
