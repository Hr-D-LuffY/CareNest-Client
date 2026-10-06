import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { guardianKeys } from '@/features/guardian/guardian.keys'
import { getGuardianProfile } from '@/features/guardian/guardian.server'
import { WalletView } from '@/features/wallet/components/wallet-view'
import { walletKeys } from '@/features/wallet/wallet.keys'
import { parseWalletViewParams, toWalletListParams } from '@/features/wallet/wallet.params'
import { getTransactionsPage } from '@/features/wallet/wallet.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Wallet' }

type WalletPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// The balance and the ledger page for the type and page in the URL are fetched here, on the server,
// and handed to the client view through the query cache, so the first paint already has them.
export default async function WalletPage({ searchParams }: WalletPageProps) {
  const raw = await searchParams
  const params = toWalletListParams(
    parseWalletViewParams({ page: first(raw.page), type: first(raw.type) }),
  )

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client fetches (and shows its own
  // error state) instead.
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: guardianKeys.profile(),
      queryFn: getGuardianProfile,
    }),
    queryClient.prefetchQuery({
      queryKey: walletKeys.list(params),
      queryFn: () => getTransactionsPage(params),
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WalletView />
    </HydrationBoundary>
  )
}
