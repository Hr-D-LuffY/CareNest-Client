import type { ReactNode } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { TierBadge } from '@/components/shared/tier-badge'
import { formatActivityTime, formatSessionDate } from '@/lib/format'
import type { Paginated, WaitlistEntry } from '@/types'
import { BOOKINGS_PAGE_SIZE } from '../booking-list.params'
import { formatPriorityScore } from '../waitlist-score'

const COLUMNS: DataTableColumn<WaitlistEntry>[] = [
  {
    id: 'child',
    header: 'Child',
    primary: true,
    cell: (row) => (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span className="font-medium">{row.child.name}</span>
        <TierBadge tier={row.child.tier} />
      </span>
    ),
  },
  { id: 'room', header: 'Room', cell: (row) => row.room.name },
  {
    id: 'date',
    header: 'Session',
    cell: (row) => <span className="whitespace-nowrap">{formatSessionDate(row.sessionDate)}</span>,
  },
  {
    id: 'score',
    header: 'Priority score',
    align: 'right',
    cell: (row) => (
      <span className="font-semibold tabular-nums">{formatPriorityScore(row.priorityScore)}</span>
    ),
  },
  {
    id: 'joined',
    header: 'Joined',
    cell: (row) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatActivityTime(row.joinedAt)}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge kind="waitlist" status={row.status} />,
  },
]

type WaitlistTableProps = {
  data: Paginated<WaitlistEntry> | undefined
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  empty: ReactNode
}

// The queues the guardian's children are in, newest first, with each priority score. The score is
// worked out by the backend and changes as others join, cancel or wait longer.
export function WaitlistTable({
  data,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onPageChange,
  empty,
}: WaitlistTableProps) {
  return (
    <DataTable
      label="Your waitlist spots"
      columns={COLUMNS}
      rows={data?.items}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError && !data}
      onRetry={onRetry}
      empty={empty}
      skeletonRows={BOOKINGS_PAGE_SIZE}
      pagination={data && { meta: data.meta, onPageChange }}
    />
  )
}
