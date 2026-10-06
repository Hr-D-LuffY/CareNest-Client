import { clientApi } from '@/lib/api/client'
import type { WalletListParams, WalletTransaction } from '@/types'

// One function per endpoint, for the browser (through the BFF). The server page uses
// wallet.server.ts instead.
export const walletApi = {
  transactions: (params: WalletListParams, signal?: AbortSignal) =>
    clientApi.getList<WalletTransaction>('/wallet/transactions', params, signal),
}
