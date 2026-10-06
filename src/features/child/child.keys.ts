import type { ChildListParams } from '@/types'

// Query keys for the child feature. Kept out of child.queries.ts ("use client") so the server page
// can use the same keys when it prefetches the list.
export const childKeys = {
  all: ['children'] as const,
  lists: () => [...childKeys.all, 'list'] as const,
  list: (params: ChildListParams) => [...childKeys.lists(), params] as const,
}
