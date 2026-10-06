// Query keys for the guardian's own profile (name, phone, wallet balance). Kept out of
// guardian.queries.ts ("use client") so a server page can prefetch with the same key.
export const guardianKeys = {
  all: ['guardian'] as const,
  profile: () => [...guardianKeys.all, 'profile'] as const,
}
