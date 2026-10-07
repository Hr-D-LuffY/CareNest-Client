import type { ReactNode } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { VEHICLE_TYPE_LABEL } from '@/lib/constants'
import { formatBDT, formatSessionDate } from '@/lib/format'
import { type Paginated, TransportStatus, type Trip } from '@/types'
import { HISTORY_PAGE_SIZE } from '../trip.params'

// What the trip brought in: the fare once it is done, nothing for a cancelled one.
function FareCell({ trip }: { trip: Trip }) {
  if (trip.status === TransportStatus.CANCELLED || trip.tripLog?.fare == null) {
    return <span className="text-muted-foreground">No fare</span>
  }
  return <span className="font-semibold tabular-nums">{formatBDT(trip.tripLog.fare)}</span>
}

type TripHistoryTableProps = {
  data: Paginated<Trip> | undefined
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  empty: ReactNode
}

// The trips that are over (completed or cancelled), newest first: a table from md up, stacked cards on
// a phone.
export function TripHistoryTable({
  data,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onPageChange,
  empty,
}: TripHistoryTableProps) {
  const columns: DataTableColumn<Trip>[] = [
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
        <span className="whitespace-nowrap">{formatSessionDate(row.booking.sessionDate)}</span>
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
        <span>
          {row.vehicle.plateNumber} · {VEHICLE_TYPE_LABEL[row.vehicle.vehicleType]}
        </span>
      ),
    },
    {
      id: 'duration',
      header: 'Duration',
      cell: (row) =>
        row.tripLog?.durationMinutes != null ? (
          <span className="tabular-nums">{row.tripLog.durationMinutes} min</span>
        ) : (
          <span className="text-muted-foreground">–</span>
        ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge kind="transport" status={row.status} />,
    },
    { id: 'fare', header: 'Fare', align: 'right', cell: (row) => <FareCell trip={row} /> },
  ]

  return (
    <DataTable
      label="Your past trips"
      columns={columns}
      rows={data?.items}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError && !data}
      onRetry={onRetry}
      empty={empty}
      skeletonRows={HISTORY_PAGE_SIZE}
      pagination={data && { meta: data.meta, onPageChange }}
    />
  )
}
