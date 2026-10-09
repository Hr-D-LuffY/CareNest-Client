'use client'

import { Eye, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { TierBadge } from '@/components/shared/tier-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { getHourlyPrice } from '@/features/room/room-price'
import { DAY_LABEL, STAFF_TYPE_LABEL } from '@/lib/constants'
import { formatBDT, formatMultiplier, formatSessionDate, formatTimeRange } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type Paginated, RoomStatus, type RoomWithSeats } from '@/types'
import { ADMIN_ROOMS_PAGE_SIZE } from '../admin-room.params'

type RoomsTableProps = {
  data: Paginated<RoomWithSeats> | undefined
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  onEdit: (room: RoomWithSeats) => void
  onDelete: (room: RoomWithSeats) => void
  empty: ReactNode
}

// The admin's rooms: a table from md up, stacked cards on a phone. The seats are for the room's
// next session (or the session date picked in the filters), shown with the date they are for.
export function RoomsTable({
  data,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onPageChange,
  onEdit,
  onDelete,
  empty,
}: RoomsTableProps) {
  const columns: DataTableColumn<RoomWithSeats>[] = [
    {
      id: 'room',
      header: 'Room',
      primary: true,
      cell: (row) => (
        <span className="flex flex-col items-start gap-1.5">
          <Link
            href={`/admin/rooms/${row.id}`}
            className="w-fit max-w-full rounded-sm font-medium break-words underline-offset-4 pointer-coarse:-my-3 pointer-coarse:py-3 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {row.name}
          </Link>
          <TierBadge tier={row.tier} />
        </span>
      ),
    },
    {
      id: 'schedule',
      header: 'Schedule',
      cell: (row) => (
        <span className="flex flex-col md:items-start">
          <span>{DAY_LABEL[row.dayOfWeek]}s</span>
          <span className="text-xs text-muted-foreground">
            {formatTimeRange(row.startTime, row.endTime)}
          </span>
        </span>
      ),
    },
    {
      id: 'staff',
      header: 'Run by',
      cell: (row) => (
        <span className="flex flex-col md:items-start">
          <Link
            href={`/admin/staff/${row.staff.id}`}
            className="w-fit rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {row.staff.user.name}
          </Link>
          <span className="text-xs text-muted-foreground">
            {STAFF_TYPE_LABEL[row.staff.staffType]}
          </span>
        </span>
      ),
    },
    {
      id: 'seats',
      header: 'Seats',
      cell: (row) => (
        <span className="flex flex-col gap-1 md:items-start">
          <StatusBadge
            kind="room"
            status={row.seatsLeft > 0 ? RoomStatus.AVAILABLE : RoomStatus.FULL}
          />
          <span className="text-xs text-muted-foreground tabular-nums">
            {row.seatsLeft} of {row.capacity} left on {formatSessionDate(row.sessionDate)}
          </span>
        </span>
      ),
    },
    {
      id: 'price',
      header: 'Price',
      cell: (row) => {
        const hourly = getHourlyPrice(row)
        return (
          <span className="flex flex-col tabular-nums md:items-start">
            <span>{hourly ? `${formatBDT(hourly)} / hour` : 'No rate yet'}</span>
            <span className="text-xs text-muted-foreground">
              {formatMultiplier(row.priceMultiplier)} multiplier
            </span>
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      actions: true,
      align: 'right',
      cell: (row) => (
        <span className="inline-flex flex-wrap items-center justify-end gap-2">
          <Link
            href={`/admin/rooms/${row.id}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-3')}
          >
            <Eye aria-hidden="true" />
            View
            <span className="sr-only"> {row.name}</span>
          </Link>
          <Button type="button" variant="outline" className="h-10 px-3" onClick={() => onEdit(row)}>
            <Pencil aria-hidden="true" />
            Edit
            <span className="sr-only"> {row.name}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10 text-destructive hover:text-destructive"
            aria-label={`Delete ${row.name}`}
            onClick={() => onDelete(row)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </span>
      ),
    },
  ]

  return (
    <DataTable
      label="Care rooms"
      columns={columns}
      rows={data?.items}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError && !data}
      onRetry={onRetry}
      empty={empty}
      skeletonRows={ADMIN_ROOMS_PAGE_SIZE}
      pagination={data && { meta: data.meta, onPageChange }}
    />
  )
}
