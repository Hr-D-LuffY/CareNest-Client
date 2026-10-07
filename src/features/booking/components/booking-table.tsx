import { CalendarX2, Eye } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { DAY_LABEL } from '@/lib/constants'
import { formatBDT, formatSessionDate, formatTimeRange, todayIso } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type Booking, BookingStatus, type Paginated } from '@/types'
import { BOOKINGS_PAGE_SIZE } from '../booking-list.params'

// A booking can be cancelled while it is active and its session has not passed. A session that
// has already started (checked in) is refused by the backend, and that message is shown as a toast.
function canCancel(booking: Booking) {
  const active =
    booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PENDING
  return active && booking.sessionDate >= todayIso()
}

// What the booking costs: the final fee once the session is done, the estimate while it is still
// to come, nothing for a cancelled one (no fee is taken).
function FeeCell({ booking }: { booking: Booking }) {
  if (booking.status === BookingStatus.CANCELLED) {
    return <span className="text-muted-foreground">No charge</span>
  }
  const final = booking.status === BookingStatus.COMPLETED && booking.finalFee !== null
  return (
    <span className="inline-flex flex-col items-end">
      <span className="font-semibold tabular-nums">
        {formatBDT(final && booking.finalFee ? booking.finalFee : booking.estimatedFee)}
      </span>
      <span className="text-xs text-muted-foreground">
        {final ? 'final fee' : 'estimated'}
        {final && booking.insufficientBalance ? ', wallet was short' : ''}
      </span>
    </span>
  )
}

type BookingTableProps = {
  data: Paginated<Booking> | undefined
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  onCancel: (booking: Booking) => void
  empty: ReactNode
}

// The guardian's bookings, newest session first: a table from md up, stacked cards on a phone.
export function BookingTable({
  data,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onPageChange,
  onCancel,
  empty,
}: BookingTableProps) {
  const columns: DataTableColumn<Booking>[] = [
    {
      id: 'child',
      header: 'Child',
      primary: true,
      cell: (row) => <span className="font-medium">{row.child.name}</span>,
    },
    {
      id: 'room',
      header: 'Room',
      cell: (row) => (
        <span className="flex flex-col md:items-start">
          <span>{row.room.name}</span>
          <span className="text-xs text-muted-foreground">
            {DAY_LABEL[row.room.dayOfWeek]}s,{' '}
            {formatTimeRange(row.room.startTime, row.room.endTime)}
          </span>
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Session',
      cell: (row) => (
        <span className="whitespace-nowrap">{formatSessionDate(row.sessionDate)}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge kind="booking" status={row.status} />,
    },
    { id: 'fee', header: 'Fee', align: 'right', cell: (row) => <FeeCell booking={row} /> },
    {
      id: 'actions',
      header: 'Actions',
      actions: true,
      align: 'right',
      cell: (row) => (
        <span className="inline-flex flex-wrap items-center justify-end gap-2">
          <Link
            href={`/dashboard/bookings/${row.id}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-3')}
          >
            <Eye aria-hidden="true" />
            Details
            <span className="sr-only">
              {' '}
              of the booking for {row.child.name} on {formatSessionDate(row.sessionDate)}
            </span>
          </Link>
          {canCancel(row) && (
            <Button
              type="button"
              variant="outline"
              className="h-10 px-3 text-destructive hover:text-destructive"
              onClick={() => onCancel(row)}
            >
              <CalendarX2 aria-hidden="true" />
              Cancel
              <span className="sr-only">
                {' '}
                booking for {row.child.name} on {formatSessionDate(row.sessionDate)}
              </span>
            </Button>
          )}
        </span>
      ),
    },
  ]

  return (
    <DataTable
      label="Your bookings"
      columns={columns}
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
