'use client'

import { Cog, ScrollText } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { formatActivityTime } from '@/lib/format'
import type { AuditLog, Paginated } from '@/types'
import { AUDIT_PAGE_SIZE } from '../audit.params'
import { describeAuditAction } from '../audit-actions'
import { describeAuditMetadata } from '../audit-details'
import { describeAuditEntity } from '../audit-entities'

// Records that have an admin page. A deleted record has none, so its events do not link.
const RECORD_PATHS: Record<string, string> = {
  Room: '/admin/rooms',
  StaffProfile: '/admin/staff',
}

const SHORT_ID_LENGTH = 8

function RecordCell({ log }: { log: AuditLog }) {
  const entity = describeAuditEntity(log.entity)
  const Icon = entity?.icon ?? ScrollText
  const basePath = RECORD_PATHS[log.entity]
  const shortId = `#${log.entityId.slice(0, SHORT_ID_LENGTH)}`
  const linkable = basePath && !log.action.includes('DELETED')

  return (
    <span className="flex flex-col">
      <span className="inline-flex items-center gap-1.5">
        <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        {entity?.label ?? log.entity}
      </span>
      {linkable ? (
        <Link
          href={`${basePath}/${log.entityId}`}
          className="w-fit rounded-sm text-xs text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {shortId}
          <span className="sr-only"> (open record)</span>
        </Link>
      ) : (
        <span className="text-xs text-muted-foreground">{shortId}</span>
      )}
    </span>
  )
}

function DetailsCell({ log }: { log: AuditLog }) {
  const details = describeAuditMetadata(log.metadata)
  if (details.length === 0) return <span className="text-muted-foreground">–</span>
  return (
    <dl className="flex flex-col gap-0.5 text-xs">
      {details.map((detail) => (
        <div key={detail.label} className="break-words">
          <dt className="inline text-muted-foreground">{detail.label}: </dt>
          <dd className="inline font-medium">{detail.value}</dd>
        </div>
      ))}
    </dl>
  )
}

const COLUMNS: DataTableColumn<AuditLog>[] = [
  {
    id: 'action',
    header: 'Event',
    primary: true,
    cell: (row) => (
      <span className="flex flex-col">
        <span className="font-medium">{describeAuditAction(row.action)}</span>
        <span className="text-xs font-normal break-all text-muted-foreground">{row.action}</span>
      </span>
    ),
  },
  {
    id: 'when',
    header: 'When',
    cell: (row) => (
      <time dateTime={row.createdAt} className="whitespace-nowrap">
        {formatActivityTime(row.createdAt)}
      </time>
    ),
  },
  {
    id: 'who',
    header: 'Who',
    cell: (row) =>
      row.user ? (
        <span className="flex flex-col items-start gap-1">
          <span className="break-words">{row.user.name}</span>
          <StatusBadge kind="role" status={row.user.role} />
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Cog aria-hidden="true" className="size-4" />
          System
        </span>
      ),
  },
  { id: 'record', header: 'Record', cell: (row) => <RecordCell log={row} /> },
  { id: 'details', header: 'Details', cell: (row) => <DetailsCell log={row} /> },
]

type AuditTableProps = {
  data: Paginated<AuditLog> | undefined
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  onRetry: () => void
  onPageChange: (page: number) => void
  empty: ReactNode
}

// The audit trail, newest first: a table from md up, stacked cards on a phone. Read only.
export function AuditTable({
  data,
  isLoading,
  isFetching,
  isError,
  onRetry,
  onPageChange,
  empty,
}: AuditTableProps) {
  return (
    <DataTable
      label="Audit log"
      columns={COLUMNS}
      rows={data?.items}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError && !data}
      onRetry={onRetry}
      empty={empty}
      skeletonRows={AUDIT_PAGE_SIZE}
      pagination={data && { meta: data.meta, onPageChange }}
    />
  )
}
