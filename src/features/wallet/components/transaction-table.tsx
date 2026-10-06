import type { ReactNode } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatActivityTime, formatBDT } from '@/lib/format'
import type { Paginated, WalletTransaction } from '@/types'
import { WALLET_PAGE_SIZE } from '../wallet.params'
import { TransactionAmount } from './transaction-amount'

const COLUMNS: DataTableColumn<WalletTransaction>[] = [
  {
    id: 'date',
    header: 'Date',
    cell: (row) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatActivityTime(row.createdAt)}
      </span>
    ),
  },
  {
    id: 'description',
    header: 'Description',
    primary: true,
    cell: (row) => <span className="font-medium">{row.description}</span>,
  },
  {
    id: 'type',
    header: 'Type',
    cell: (row) => <StatusBadge kind="transaction" status={row.type} />,
  },
  {
    id: 'amount',
    header: 'Amount',
    align: 'right',
    cell: (row) => <TransactionAmount transaction={row} />,
  },
  {
    id: 'balance',
    header: 'Balance after',
    align: 'right',
    cell: (row) => <span className="tabular-nums">{formatBDT(row.balanceAfter)}</span>,
  },
]

type TransactionTableProps = {
  data: Paginated<WalletTransaction> | undefined
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  empty: ReactNode
}

// The wallet ledger, newest first: a table from md up, stacked cards on a phone.
export function TransactionTable({
  data,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onPageChange,
  empty,
}: TransactionTableProps) {
  return (
    <DataTable
      label="Wallet transactions"
      columns={COLUMNS}
      rows={data?.items}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError && !data}
      onRetry={onRetry}
      empty={empty}
      skeletonRows={WALLET_PAGE_SIZE}
      pagination={data && { meta: data.meta, onPageChange }}
    />
  )
}
