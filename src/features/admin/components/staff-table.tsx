'use client'

import { Eye, MoreHorizontal, ShieldCheck, ShieldX, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { STAFF_TYPE_LABEL } from '@/lib/constants'
import { formatBDT } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type Paginated, type StaffProfile, VerificationStatus } from '@/types'
import { ADMIN_STAFF_PAGE_SIZE } from '../admin-staff.params'

// Hourly and per-minute rates, one per line. A sitter has no per-minute rate and a driver no hourly
// one, so each only shows when it exists.
export function RatesText({ staff }: { staff: StaffProfile }) {
  if (staff.hourlyRate === null && staff.perMinuteRate === null) {
    return <span className="text-muted-foreground">Not set</span>
  }
  return (
    <span className="flex flex-col tabular-nums md:items-start">
      {staff.hourlyRate !== null && <span>{formatBDT(staff.hourlyRate)} / hour</span>}
      {staff.perMinuteRate !== null && <span>{formatBDT(staff.perMinuteRate)} / minute</span>}
    </span>
  )
}

type StaffTableProps = {
  data: Paginated<StaffProfile> | undefined
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  onVerify: (staff: StaffProfile) => void
  onReject: (staff: StaffProfile) => void
  onDelete: (staff: StaffProfile) => void
  empty: ReactNode
}

// The staff list, newest first: a table from md up, stacked cards on a phone. Each row has the
// decision that makes sense for its status as a button (Verify), and the rest in a menu.
export function StaffTable({
  data,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onPageChange,
  onVerify,
  onReject,
  onDelete,
  empty,
}: StaffTableProps) {
  const columns: DataTableColumn<StaffProfile>[] = [
    {
      id: 'staff',
      header: 'Staff',
      primary: true,
      cell: (row) => (
        <span className="flex items-center gap-3">
          <UserAvatar name={row.user.name} photo={row.user.profilePhoto} size={40} />
          <span className="flex min-w-0 flex-col">
            <Link
              href={`/admin/staff/${row.id}`}
              className="w-fit max-w-full rounded-sm font-medium break-words underline-offset-4 pointer-coarse:-my-3 pointer-coarse:py-3 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {row.user.name}
            </Link>
            <span className="text-xs font-normal break-all text-muted-foreground">
              {row.user.email}
            </span>
          </span>
        </span>
      ),
    },
    { id: 'role', header: 'Role', cell: (row) => STAFF_TYPE_LABEL[row.staffType] },
    { id: 'rates', header: 'Rates', cell: (row) => <RatesText staff={row} /> },
    {
      id: 'experience',
      header: 'Experience',
      cell: (row) => (
        <span className="tabular-nums">
          {row.experience} {row.experience === 1 ? 'year' : 'years'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge kind="verification" status={row.verificationStatus} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      actions: true,
      align: 'right',
      cell: (row) => (
        <span className="inline-flex flex-wrap items-center justify-end gap-2">
          <Link
            href={`/admin/staff/${row.id}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-3')}
          >
            <Eye aria-hidden="true" />
            View
            <span className="sr-only"> {row.user.name}</span>
          </Link>
          {row.verificationStatus !== VerificationStatus.VERIFIED && (
            <Button
              type="button"
              variant="outline"
              className="h-10 px-3 text-success hover:text-success"
              onClick={() => onVerify(row)}
            >
              <ShieldCheck aria-hidden="true" />
              Verify
              <span className="sr-only"> {row.user.name}</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-10"
                  aria-label={`More actions for ${row.user.name}`}
                />
              }
            >
              <MoreHorizontal aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {row.verificationStatus !== VerificationStatus.REJECTED && (
                <>
                  <DropdownMenuItem className="min-h-10 gap-2 px-2" onClick={() => onReject(row)}>
                    <ShieldX aria-hidden="true" />
                    Reject
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                variant="destructive"
                className="min-h-10 gap-2 px-2"
                onClick={() => onDelete(row)}
              >
                <Trash2 aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      ),
    },
  ]

  return (
    <DataTable
      label="Staff"
      columns={columns}
      rows={data?.items}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError && !data}
      onRetry={onRetry}
      empty={empty}
      skeletonRows={ADMIN_STAFF_PAGE_SIZE}
      pagination={data && { meta: data.meta, onPageChange }}
    />
  )
}
