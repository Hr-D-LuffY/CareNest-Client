import type { WalletListParams } from '@/types'

// Query keys for the wallet ledger. Kept out of wallet.queries.ts ("use client") so the server page
// can use the same keys when it prefetches the list.
export const walletKeys = {
  all: ['wallet'] as const,
  lists: () => [...walletKeys.all, 'list'] as const,
  list: (params: WalletListParams) => [...walletKeys.lists(), params] as const,
}
