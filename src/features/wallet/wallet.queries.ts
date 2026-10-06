'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { WalletListParams } from '@/types'
import { walletApi } from './wallet.api'
import { walletKeys } from './wallet.keys'

export function useTransactionsQuery(params: WalletListParams) {
  return useQuery({
    queryKey: walletKeys.list(params),
    queryFn: ({ signal }) => walletApi.transactions(params, signal),
    // Keep showing the old page while the next one loads, so paging does not flash a skeleton.
    placeholderData: keepPreviousData,
  })
}
