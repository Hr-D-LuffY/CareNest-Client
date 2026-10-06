import { DEFAULT_PAGE } from '@/lib/constants'
import { type WalletListParams, WalletTransactionType } from '@/types'

// Ledger rows shown per page.
export const WALLET_PAGE_SIZE = 10

// What the page shows, read from the URL (?type=&page=).
export type WalletViewParams = {
  page: number
  type?: WalletTransactionType
}

const TYPES: readonly WalletTransactionType[] = Object.values(WalletTransactionType)

// The view's params from the raw URL values. A hand-edited URL falls back to "page 1, no filter"
// instead of reaching the backend as a 400. Both the server page (prefetch) and the client list call
// this, so they build the same query key.
export function parseWalletViewParams(raw: {
  page?: string | null
  type?: string | null
}): WalletViewParams {
  const page = Number(raw.page)
  const type = TYPES.find((option) => option === raw.type)
  return {
    page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE,
    ...(type && { type }),
  }
}

// The backend's query for a view: filtering and paging are done there.
export function toWalletListParams({ page, type }: WalletViewParams): WalletListParams {
  return { page, limit: WALLET_PAGE_SIZE, ...(type && { type }) }
}
