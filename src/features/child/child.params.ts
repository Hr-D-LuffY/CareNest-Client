import { DEFAULT_PAGE } from '@/lib/constants'
import { type ChildListParams, Tier } from '@/types'

// Children shown per page.
export const CHILDREN_PAGE_SIZE = 9

// What the "Sort by" menu offers, and the backend's sortBy / sortOrder each one means. A later
// date of birth is a younger child, so "youngest first" is dateOfBirth descending.
export const CHILD_SORTS = [
  { value: 'newest', label: 'Recently added', sortBy: 'createdAt', sortOrder: 'desc' },
  { value: 'age-asc', label: 'Age: youngest first', sortBy: 'dateOfBirth', sortOrder: 'desc' },
  { value: 'age-desc', label: 'Age: oldest first', sortBy: 'dateOfBirth', sortOrder: 'asc' },
  { value: 'name', label: 'Name: A to Z', sortBy: 'name', sortOrder: 'asc' },
] as const

export type ChildSort = (typeof CHILD_SORTS)[number]['value']

// What the page shows, read from the URL (?tier=&sort=&page=).
export type ChildViewParams = {
  page: number
  sort: ChildSort
  tier?: Tier
}

const TIERS: readonly Tier[] = Object.values(Tier)

// The view's params from the raw URL values. A hand-edited URL falls back to "page 1, newest first,
// no filter" instead of reaching the backend as a 400. Both the server page (prefetch) and the
// client list call this, so they build the same query key.
export function parseChildViewParams(raw: {
  page?: string | null
  tier?: string | null
  sort?: string | null
}): ChildViewParams {
  const page = Number(raw.page)
  const tier = TIERS.find((option) => option === raw.tier)
  const sort = CHILD_SORTS.find((option) => option.value === raw.sort)?.value ?? 'newest'
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    sort,
    ...(tier && { tier }),
  }
}

// The backend's query for a view: filtering, sorting and paging are all done there.
export function toChildListParams({ page, sort, tier }: ChildViewParams): ChildListParams {
  const { sortBy, sortOrder } =
    CHILD_SORTS.find((option) => option.value === sort) ?? CHILD_SORTS[0]
  return { page, limit: CHILDREN_PAGE_SIZE, sortBy, sortOrder, ...(tier && { tier }) }
}
