import type { ReactNode } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { TierBadge } from '@/components/shared/tier-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { formatActivityTime, formatBDT } from '@/lib/format'
import type { Paginated, RoomBooking } from '@/types'
import { ROOM_ROSTER_PAGE_SIZE } from '../room-roster.params'

// Whether the child has arrived: not yet, in the room, or collected.
function Attendance({ booking }: { booking: RoomBooking }) {
  const { checkinLog, status } = booking
  if (status === 'CANCELLED') return <span className="text-muted-foreground">–</span>
  if (!checkinLog) return <span className="text-muted-foreground">Not checked in</span>
  return (
    <span className="flex flex-col text-sm whitespace-nowrap">
      <span>
        <span className="text-muted-foreground">In </span>
        {formatActivityTime(checkinLog.checkInAt)}
      </span>
      {checkinLog.checkOutAt ? (
        <span>
          <span className="text-muted-foreground">Out </span>
          {formatActivityTime(checkinLog.checkOutAt)}
        </span>
      ) : (
        <span className="font-medium text-success">In the room now</span>
      )}
    </span>
  )
}

// The charged fee once the child is checked out, the estimate before that.
function Fee({ booking }: { booking: RoomBooking }) {
  if (booking.status === 'CANCELLED') return <span className="text-muted-foreground">–</span>
  return (
    <span className="flex flex-col whitespace-nowrap">
      {booking.finalFee ? (
        <span className="font-medium tabular-nums">{formatBDT(booking.finalFee)}</span>
      ) : (
        <span className="tabular-nums">
          {formatBDT(booking.estimatedFee)}{' '}
          <span className="text-xs text-muted-foreground">estimated</span>
        </span>
      )}
      {booking.insufficientBalance && (
        <span className="text-xs text-warning">Wallet was short at check-out</span>
      )}
    </span>
  )
}

type RoomRosterTableProps = {
  data: Paginated<RoomBooking> | undefined
  roomName: string
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  empty: ReactNode
}

const COLUMNS: DataTableColumn<RoomBooking>[] = [
  {
    id: 'child',
    header: 'Child',
    primary: true,
    cell: (row) => (
      <span className="inline-flex flex-wrap items-center gap-2">
        <UserAvatar name={row.child.name} photo={row.child.profilePhoto} size={32} />
        <span className="font-medium">{row.child.name}</span>
        <TierBadge tier={row.child.tier} />
      </span>
    ),
  },
  {
    id: 'guardian',
    header: 'Booked by',
    cell: (row) => (
      <span className="flex flex-col">
        <span>{row.guardian.user.name}</span>
        <span className="text-xs text-muted-foreground">{row.guardian.phone}</span>
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Booking',
    cell: (row) => <StatusBadge kind="booking" status={row.status} />,
  },
  { id: 'attendance', header: 'Attendance', cell: (row) => <Attendance booking={row} /> },
  { id: 'fee', header: 'Fee', cell: (row) => <Fee booking={row} /> },
  {
    id: 'booked',
    header: 'Booked on',
    cell: (row) => <span className="whitespace-nowrap">{formatActivityTime(row.createdAt)}</span>,
  },
]

// Everyone booked into one session of a room: a table from md up, cards on a phone.
export function RoomRosterTable({
  data,
  roomName,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onPageChange,
  empty,
}: RoomRosterTableProps) {
  return (
    <DataTable
      label={`Children booked into ${roomName}`}
      columns={COLUMNS}
      rows={data?.items}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError && !data}
      onRetry={onRetry}
      empty={empty}
      skeletonRows={ROOM_ROSTER_PAGE_SIZE}
      pagination={data && { meta: data.meta, onPageChange }}
    />
  )
}
