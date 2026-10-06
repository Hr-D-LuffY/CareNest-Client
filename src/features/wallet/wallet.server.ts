import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { WalletListParams, WalletTransaction } from '@/types'

export const getTransactionsPage = (params: WalletListParams) =>
  serverApi.getList<WalletTransaction>('/wallet/transactions', params)
