import { ArrowDownLeft, ArrowUpRight, ReceiptText, Wallet } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatActivityTime, formatBDT } from '@/lib/format'
import { cn } from '@/lib/utils'
import { WalletTransactionType } from '@/types/enums'
import type { WalletTransaction } from '@/types/wallet'

// The last few wallet movements. Money in is green with a "+" and a down arrow, money out has a
// "−" and an up arrow, so direction never relies on colour alone.
export function RecentActivity({ transactions }: { transactions: WalletTransaction[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center justify-between gap-2">
        <h2 className="font-heading text-lg">Recent activity</h2>
        <Link
          href="/dashboard/wallet"
          className="inline-flex min-h-9 items-center gap-1 rounded-md px-1 text-sm font-medium text-info hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Wallet
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyState
            bare
            icon={ReceiptText}
            title="No wallet activity yet"
            description="Top-ups, care fees and ride fares appear here as they happen."
            action={
              <Link
                href="/dashboard/wallet"
                className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-4')}
              >
                <Wallet aria-hidden="true" />
                Top up wallet
              </Link>
            }
          />
        ) : (
          <ul className="flex flex-col divide-y">
            {transactions.map((transaction) => {
              const isCredit = transaction.type === WalletTransactionType.TOPUP
              const Icon = isCredit ? ArrowDownLeft : ArrowUpRight
              return (
                <li
                  key={transaction.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full',
                      isCredit ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{transaction.description}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatActivityTime(transaction.createdAt)}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end">
                    <span
                      className={cn(
                        'text-sm font-semibold tabular-nums',
                        isCredit && 'text-success',
                      )}
                    >
                      <span className="sr-only">{isCredit ? 'Added ' : 'Spent '}</span>
                      {isCredit ? '+' : '−'}
                      {formatBDT(transaction.amount)}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      Balance {formatBDT(transaction.balanceAfter)}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
