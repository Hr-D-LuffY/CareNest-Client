'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { guardianKeys } from '@/features/guardian/guardian.keys'
import { walletKeys } from '@/features/wallet/wallet.keys'

// Renders nothing. Money has just arrived, so any wallet balance or ledger page already in the
// query cache is out of date: mark it stale so the wallet page shows the new numbers.
export function RefreshWalletData() {
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: guardianKeys.all })
    queryClient.invalidateQueries({ queryKey: walletKeys.all })
  }, [queryClient])

  return null
}
