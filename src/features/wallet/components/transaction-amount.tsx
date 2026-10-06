import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatBDT } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type WalletTransaction, WalletTransactionType } from '@/types'

// The amount of one ledger row. Money in is green with a "+" and a down arrow, money out has a "−"
// and an up arrow, so direction never relies on colour alone. The backend's `amount` is always
// positive; the type says which way it went.
export function TransactionAmount({ transaction }: { transaction: WalletTransaction }) {
  const isCredit = transaction.type === WalletTransactionType.TOPUP
  const Icon = isCredit ? ArrowDownLeft : ArrowUpRight

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold tabular-nums',
        isCredit && 'text-success',
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span className="sr-only">{isCredit ? 'Added ' : 'Spent '}</span>
      {isCredit ? '+' : '−'}
      {formatBDT(transaction.amount)}
    </span>
  )
}
