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

// Body of POST /child and PATCH /child/:id (backend: child.interface.ts). On update, a blank
// allergies or conditions is sent as null, which clears it.
export type ChildPayload = {
  name: string
  dateOfBirth: string
  tier: Tier
  allergies?: string | null
  conditions?: string | null
  emergencyContactName: string
  emergencyContactPhone: string
}

// Query params of GET /child (backend: child.interface.ts).
export type ChildListParams = {
  page: number
  limit: number
  tier?: Tier
  sortBy: 'createdAt' | 'dateOfBirth' | 'name'
  sortOrder: 'asc' | 'desc'
}
