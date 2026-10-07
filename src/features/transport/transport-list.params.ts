import { DEFAULT_PAGE } from '@/lib/constants'
import { type TransportListParams, TransportStatus } from '@/types'

// Rows shown per page on the transport page.
export const TRANSPORT_PAGE_SIZE = 10

// The tabs of the transport page, and the status each one asks the backend for.
export const TRANSPORT_TABS = [
  { value: 'all', label: 'All', status: undefined },
  { value: 'requested', label: 'Requested', status: TransportStatus.REQUESTED },
  { value: 'on-the-way', label: 'On the way', status: TransportStatus.IN_PROGRESS },
  { value: 'completed', label: 'Completed', status: TransportStatus.COMPLETED },
  { value: 'cancelled', label: 'Cancelled', status: TransportStatus.CANCELLED },
] as const

export type TransportTab = (typeof TRANSPORT_TABS)[number]['value']

// What the page shows, read from the URL (?tab=&page=).
export type TransportViewParams = {
  page: number
  tab: TransportTab
}

// The view's params from the raw URL values. A hand-edited URL falls back to "All, page 1" instead
// of reaching the backend as a 400. Both the server page (prefetch) and the client list call this,
// so they build the same query key.
export function parseTransportViewParams(raw: {
  page?: string | null
  tab?: string | null
}): TransportViewParams {
  const page = Number(raw.page)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    tab: TRANSPORT_TABS.find((option) => option.value === raw.tab)?.value ?? 'all',
  }
}

// The backend's query for a tab: filtering and paging are done there.
export function toTransportListParams({ page, tab }: TransportViewParams): TransportListParams {
  const status = TRANSPORT_TABS.find((option) => option.value === tab)?.status
  return { page, limit: TRANSPORT_PAGE_SIZE, ...(status && { status }) }
}
