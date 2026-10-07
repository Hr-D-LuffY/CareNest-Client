import { ArrowUpFromLine } from 'lucide-react'
import type { ReactNode } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { TierBadge } from '@/components/shared/tier-badge'
import { formatPriorityScore } from '@/features/booking/waitlist-score'
import { formatActivityTime, formatSessionDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Paginated, RoomWaitlistEntry } from '@/types'
import { formatWaited, ROOM_WAITLIST_PAGE_SIZE } from '../waitlist.params'

// The place in the queue. The first one is the child the next free seat goes to, so it gets the brand
// gradient and a label (the label, not the colour, carries the meaning).
function Position({ place }: { place: number }) {
  if (place === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-br from-primary to-[color-mix(in_oklch,var(--primary),black_30%)] px-3 py-1 text-xs font-semibold text-primary-foreground shadow-soft">
        <ArrowUpFromLine aria-hidden="true" className="size-3.5" />
        Next in line
      </span>
    )
  }
  return (
    <span className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold tabular-nums">
      <span className="sr-only">Place </span>
      {place}
    </span>
  )
}

// The score and a bar showing it next to the other scores on the page: the best one is full and the
// worst keeps a short stub, so the bars still tell them apart when every score is negative (recent
// cancellations count against a guardian). The number is the truth; the bar is only a hint.
const MIN_BAR_PERCENT = 10

function Score({ score, lowest, highest }: { score: number; lowest: number; highest: number }) {
  const share =
    highest === lowest
      ? 100
      : MIN_BAR_PERCENT + ((100 - MIN_BAR_PERCENT) * (score - lowest)) / (highest - lowest)
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <span className="font-semibold tabular-nums">{formatPriorityScore(score)}</span>
      {/* Decorative: the score is already written out. */}
      <span aria-hidden="true" className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-full bg-linear-to-r from-info-soft to-primary"
          style={{ width: `${share}%` }}
        />
      </span>
    </span>
  )
}

type RoomWaitlistTableProps = {
  data: Paginated<RoomWaitlistEntry> | undefined
  roomName: string
  // True when the list is one session's queue. Only then is a place in the queue meaningful: the
  // ranking of "all sessions" mixes queues that are promoted separately.
  singleSession: boolean
  // The current time in ms, or null before the page has mounted (see useNow).
  now: number | null
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  empty: ReactNode
}

// A room's pending queue, best priority score first: a table from md up, cards on a phone.
export function RoomWaitlistTable({
  data,
  roomName,
  singleSession,
  now,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onPageChange,
  empty,
}: RoomWaitlistTableProps) {
  const offset = data ? (data.meta.page - 1) * data.meta.limit : 0
  const scores = data?.items.map((entry) => entry.priorityScore) ?? []
  const [lowest, highest] = [Math.min(...scores), Math.max(...scores)]
  const placeOf = (row: RoomWaitlistEntry) => offset + (data?.items.indexOf(row) ?? 0) + 1

  const columns: DataTableColumn<RoomWaitlistEntry>[] = [
    ...(singleSession
      ? [
          {
            id: 'place',
            header: 'Place',
            cell: (row: RoomWaitlistEntry) => <Position place={placeOf(row)} />,
          },
        ]
      : []),
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
    { id: 'guardian', header: 'Guardian', cell: (row) => row.guardian.user.name },
    ...(singleSession
      ? []
      : [
          {
            id: 'session',
            header: 'Session',
            cell: (row: RoomWaitlistEntry) => (
              <span className="whitespace-nowrap">{formatSessionDate(row.sessionDate)}</span>
            ),
          },
        ]),
    {
      id: 'score',
      header: 'Priority score',
      align: 'right',
      cell: (row) => <Score score={row.priorityScore} lowest={lowest} highest={highest} />,
    },
    {
      id: 'waiting',
      header: 'Waiting',
      cell: (row) => (
        <span className="flex flex-col whitespace-nowrap">
          <span className={cn('font-medium tabular-nums', now === null && 'invisible')}>
            {now === null ? '–' : formatWaited(row.joinedAt, now)}
          </span>
          <span className="text-xs text-muted-foreground">
            since {formatActivityTime(row.joinedAt)}
          </span>
        </span>
      ),
    },
  ]

  return (
    <DataTable
      label={`Waitlist for ${roomName}`}
      columns={columns}
      rows={data?.items}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError && !data}
      onRetry={onRetry}
      empty={empty}
      skeletonRows={ROOM_WAITLIST_PAGE_SIZE}
      pagination={data && { meta: data.meta, onPageChange }}
    />
  )
}
