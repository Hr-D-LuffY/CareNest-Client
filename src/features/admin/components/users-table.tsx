'use client'

import { Eye } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { buttonVariants } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AdminUser, Paginated } from '@/types'
import { ADMIN_USERS_PAGE_SIZE } from '../admin-user.params'

type UsersTableProps = {
  data: Paginated<AdminUser> | undefined
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  empty: ReactNode
}

// Every account on the platform, newest first: a table from md up, stacked cards on a phone. Each row
// opens the user's profile.
export function UsersTable({
  data,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onPageChange,
  empty,
}: UsersTableProps) {
  const columns: DataTableColumn<AdminUser>[] = [
    {
      id: 'user',
      header: 'User',
      primary: true,
      cell: (row) => (
        <span className="flex items-center gap-3">
          <UserAvatar name={row.name} photo={row.profilePhoto} size={40} />
          <span className="flex min-w-0 flex-col">
            <Link
              href={`/admin/users/${row.id}`}
              className="w-fit max-w-full rounded-sm font-medium break-words underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {row.name}
            </Link>
            <span className="text-xs font-normal break-all text-muted-foreground">{row.email}</span>
          </span>
        </span>
      ),
    },
    { id: 'role', header: 'Role', cell: (row) => <StatusBadge kind="role" status={row.role} /> },
    {
      id: 'joined',
      header: 'Joined',
      cell: (row) => (
        <span className="whitespace-nowrap">{row.createdAt ? formatDate(row.createdAt) : '–'}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      actions: true,
      align: 'right',
      cell: (row) => (
        <Link
          href={`/admin/users/${row.id}`}
          className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-3')}
        >
          <Eye aria-hidden="true" />
          View profile
          <span className="sr-only"> of {row.name}</span>
        </Link>
      ),
    },
  ]

  return (
    <DataTable
      label="Users"
      columns={columns}
      rows={data?.items}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError && !data}
      onRetry={onRetry}
      empty={empty}
      skeletonRows={ADMIN_USERS_PAGE_SIZE}
      pagination={data && { meta: data.meta, onPageChange }}
    />
  )
}
