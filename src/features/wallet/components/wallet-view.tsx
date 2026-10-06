'use client'

import { ReceiptText } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { EmptyState } from '@/components/shared/empty-state'
import { Button, buttonVariants } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { cn } from '@/lib/utils'
import { WalletTransactionType } from '@/types'
import { parseWalletViewParams, toWalletListParams } from '../wallet.params'
import { useTransactionsQuery } from '../wallet.queries'
import { BalanceCard } from './balance-card'
import { TransactionTable } from './transaction-table'

const TYPE_FILTERS = [
  { value: undefined, label: 'All' },
  { value: WalletTransactionType.TOPUP, label: 'Top-ups' },
  { value: WalletTransactionType.CARE_FEE, label: 'Care fees' },
  { value: WalletTransactionType.TRANSPORT_FARE, label: 'Ride fares' },
] as const

// The guardian's wallet: the balance, and the ledger of every top-up, care fee and ride fare. The
// URL (?type=&page=) is the single source of truth for the ledger, so a refresh or a shared link
// shows the same page. The server page has already prefetched the first load.
export function WalletView() {
  const query = useQueryParams()
  const params = parseWalletViewParams({ page: query.get('page'), type: query.get('type') })
  const { data, isPending, isError, isFetching, refetch } = useTransactionsQuery(
    toWalletListParams(params),
  )

  const total = data?.meta.total ?? 0
  const lastPage = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1
  const activeFilter = TYPE_FILTERS.find((filter) => filter.value === params.type)

  // A hand-edited ?page=99 leaves an empty page. Step back to the last page that has rows.
  useEffect(() => {
    if (data && total > 0 && params.page > lastPage) query.setPage(lastPage)
  }, [data, total, params.page, lastPage, query])

  const empty = params.type ? (
    <EmptyState
      icon={ReceiptText}
      title={`No ${activeFilter?.label.toLowerCase() ?? 'activity'} yet`}
      description="Nothing of this kind has gone through your wallet. Show all activity to see everything."
      action={
        <Button
          type="button"
          variant="outline"
          className="h-10 px-4"
          onClick={() => query.clear('type')}
        >
          Show all activity
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={ReceiptText}
      title="No wallet activity yet"
      description="Top-ups, care fees and ride fares show up here as they happen, newest first."
      action={
        <Link
          href="/dashboard/rooms"
          className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-4')}
        >
          Browse care rooms
        </Link>
      }
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-balance md:text-3xl">Wallet</h1>
          <p className="text-muted-foreground">
            Your balance and every movement of money, from top-ups to care fees and ride fares.
          </p>
        </header>
      </Reveal>

      <Reveal>
        <BalanceCard />
      </Reveal>

      <section aria-labelledby="history-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="history-heading" className="text-xl">
            Transaction history
          </h2>
          {data && (
            <p aria-live="polite" className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{total}</span>{' '}
              {total === 1 ? 'transaction' : 'transactions'}
            </p>
          )}
        </div>

        <fieldset className="flex min-w-0 flex-wrap gap-2">
          <legend className="sr-only">Filter by transaction type</legend>
          {TYPE_FILTERS.map(({ value, label }) => {
            const active = params.type === value
            return (
              <Button
                key={label}
                type="button"
                variant={active ? 'default' : 'outline'}
                aria-pressed={active}
                className="h-10 px-4"
                onClick={() => query.set({ type: value })}
              >
                {label}
              </Button>
            )
          })}
        </fieldset>

        <TransactionTable
          data={data}
          isLoading={isPending}
          isFetching={isFetching}
          isError={isError}
          onRetry={() => refetch()}
          onPageChange={query.setPage}
          empty={empty}
        />
      </section>
    </div>
  )
}
