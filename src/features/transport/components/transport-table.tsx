import { CalendarX2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { VEHICLE_TYPE_LABEL } from '@/lib/constants'
import { formatBDT, formatSessionDate, formatTimeRange } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type Paginated, type Transport, TransportStatus } from '@/types'
import { TRANSPORT_PAGE_SIZE } from '../transport-list.params'

// What the ride costs: the fare once the trip is done, the base fare while it is still to come,
// nothing for a cancelled ride (no fare is taken).
function FareCell({ ride }: { ride: Transport }) {
  if (ride.status === TransportStatus.CANCELLED) {
    return <span className="text-muted-foreground">No charge</span>
  }
  const final = ride.status === TransportStatus.COMPLETED && ride.tripLog?.fare != null
  return (
    <span className="inline-flex flex-col items-end">
      <span className="font-semibold tabular-nums">
        {formatBDT(final && ride.tripLog?.fare ? ride.tripLog.fare : ride.baseFare)}
      </span>
      <span className="text-xs text-muted-foreground">{final ? 'final fare' : 'base fare'}</span>
    </span>
  )
}

type TransportTableProps = {
  data: Paginated<Transport> | undefined
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  onCancel: (ride: Transport) => void
  empty: ReactNode
}

// The guardian's rides, newest first: a table from md up, stacked cards on a phone. Each row opens
// the booking it belongs to, which is where a ride is requested.
export function TransportTable({
  data,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onPageChange,
  onCancel,
  empty,
}: TransportTableProps) {
  const columns: DataTableColumn<Transport>[] = [
    {
      id: 'child',
      header: 'Child',
      primary: true,
      cell: (row) => <span className="font-medium">{row.booking.child.name}</span>,
    },
    {
      id: 'session',
      header: 'Session',
      cell: (row) => (
        <span className="flex flex-col md:items-start">
          <span className="whitespace-nowrap">{formatSessionDate(row.booking.sessionDate)}</span>
          <span className="text-xs text-muted-foreground">
            {row.booking.room.name},{' '}
            {formatTimeRange(row.booking.room.startTime, row.booking.room.endTime)}
          </span>
        </span>
      ),
    },
    {
      id: 'route',
      header: 'Route',
      cell: (row) => (
        <span className="flex flex-col text-left md:max-w-64">
          <span className="break-words">
            <span className="text-xs text-muted-foreground">From </span>
            {row.pickupAddress}
          </span>
          <span className="break-words">
            <span className="text-xs text-muted-foreground">To </span>
            {row.dropoffAddress}
          </span>
        </span>
      ),
    },
    {
      id: 'vehicle',
      header: 'Vehicle',
      cell: (row) => (
        <span className="flex flex-col md:items-start">
          <span>
            {row.vehicle.plateNumber} · {VEHICLE_TYPE_LABEL[row.vehicle.vehicleType]}
          </span>
          <span className="text-xs text-muted-foreground">Driver {row.driver.user.name}</span>
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge kind="transport" status={row.status} />,
    },
    { id: 'fare', header: 'Fare', align: 'right', cell: (row) => <FareCell ride={row} /> },
    {
      id: 'actions',
      header: 'Actions',
      actions: true,
      align: 'right',
      cell: (row) => (
        <span className="inline-flex flex-wrap items-center justify-end gap-2">
          <Link
            href={`/dashboard/bookings/${row.booking.id}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-3')}
          >
            <ExternalLink aria-hidden="true" />
            Booking
            <span className="sr-only">
              {' '}
              for {row.booking.child.name} on {formatSessionDate(row.booking.sessionDate)}
            </span>
          </Link>
          {row.status === TransportStatus.REQUESTED && (
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
                ride for {row.booking.child.name} on {formatSessionDate(row.booking.sessionDate)}
              </span>
            </Button>
          )}
        </span>
      ),
    },
  ]

  return (
    <DataTable
      label="Your rides"
      columns={columns}
      rows={data?.items}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError && !data}
      onRetry={onRetry}
      empty={empty}
      skeletonRows={TRANSPORT_PAGE_SIZE}
      pagination={data && { meta: data.meta, onPageChange }}
    />
  )
}
