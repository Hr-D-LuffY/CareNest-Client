import type { StaffRatingsParams } from './staff.params'

// Query keys for the staff feature. Kept out of staff.queries.ts ("use client") so a server page can
// use the same keys when it hands data to the client.
export const staffKeys = {
  all: ['staff'] as const,
  ratings: (staffId: string, params: StaffRatingsParams) =>
    [...staffKeys.all, 'ratings', staffId, params] as const,
}
