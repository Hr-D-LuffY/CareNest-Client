import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { PaginationMeta } from '@/types/api'

export type SortOrder = 'asc' | 'desc'

export type DataTableSort = { key: string; order: SortOrder }

export type DataTableColumn<T> = {
  // Stable key for the column (React key, and the label's identity on the mobile card).
  id: string
  header: string
  cell: (row: T) => ReactNode
  // Makes the header a sort button. Its value is what onSortChange receives, so it should be the
  // backend's `sortBy` value.
  sortKey?: string
  align?: 'left' | 'right'
  // The column that titles each card on phones (name, child, room). Shown without a label.
  primary?: boolean
  // Row actions (buttons, menus). Shown at the bottom of the card, without a label.
  actions?: boolean
  // Applied to the <td> / <th> on md and up.
  className?: string
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  rows: readonly T[] | undefined
  getRowId: (row: T) => string
  // Screen-reader name for the table, e.g. "Your bookings".
  label: string
  isLoading?: boolean
  // True while a refetch (new page, filter or sort) is running over the old rows.
  isFetching?: boolean
  isError?: boolean
  onRetry?: () => void
  // Shown when the query succeeded with no rows. Required so no list ever renders a blank table.
  empty: ReactNode
  sort?: DataTableSort
  onSortChange?: (key: string, order: SortOrder) => void
  pagination?: { meta: PaginationMeta; onPageChange: (page: number) => void }
  // How many skeleton rows to show while loading. Match the page size.
  skeletonRows?: number
  className?: string
}

const SKELETON_ROWS = 5

// [0, 1, 2, ...]: stable keys for the static skeleton placeholders.
const range = (count: number) => [...Array(count).keys()]

function SortIcon({ order }: { order: SortOrder | undefined }) {
  if (order === 'asc') return <ArrowUp aria-hidden="true" className="size-3.5" />
  if (order === 'desc') return <ArrowDown aria-hidden="true" className="size-3.5" />
  return <ArrowUpDown aria-hidden="true" className="size-3.5 opacity-50" />
}

function ariaSort(order: SortOrder | undefined) {
  if (order === 'asc') return 'ascending'
  if (order === 'desc') return 'descending'
  return undefined
}

// The matching loading placeholder, also used on its own by loading.tsx files.
export function DataTableSkeleton({
  columns,
  rows = SKELETON_ROWS,
}: {
  columns: number
  rows?: number
}) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <ul className="flex flex-col gap-3 md:hidden">
        {range(rows).map((i) => (
          <li
            key={i}
            className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 md:block">
        <div className="flex gap-6 border-b px-4 py-3">
          {range(columns).map((i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {range(rows).map((r) => (
          <div key={r} className="flex gap-6 border-b px-4 py-4 last:border-0">
            {range(columns).map((c) => (
              <Skeleton key={c} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// One table for every list in the app (bookings, children, staff, rooms, users, audit logs,
// transactions). A real <table> from md up; stacked cards below that, so nothing scrolls sideways
// on a phone. It holds no state: sorting and the page come in as props and go out as callbacks, so
// the URL stays the single source of truth. Plain markup with no hooks, so a Server Component can
// render it too (without the callbacks).
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  label,
  isLoading,
  isFetching,
  isError,
  onRetry,
  empty,
  sort,
  onSortChange,
  pagination,
  skeletonRows,
  className,
}: DataTableProps<T>) {
  if (isLoading) return <DataTableSkeleton columns={columns.length} rows={skeletonRows} />

  if (isError) return <ListErrorState onRetry={onRetry} />

  if (!rows || rows.length === 0) return <>{empty}</>

  const primary = columns.find((column) => column.primary)
  const actions = columns.filter((column) => column.actions)
  const details = columns.filter((column) => column !== primary && !column.actions)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div
        aria-busy={isFetching || undefined}
        className={cn('transition-opacity', isFetching && 'opacity-60')}
      >
        <ul aria-label={label} className="flex flex-col gap-3 md:hidden">
          {rows.map((row) => (
            <li
              key={getRowId(row)}
              className="flex flex-col gap-3 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10"
            >
              {primary && <div className="font-semibold">{primary.cell(row)}</div>}
              <dl className="flex flex-col gap-2">
                {details.map((column) => (
                  <div key={column.id} className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{column.header}</dt>
                    <dd className="min-w-0 text-right">{column.cell(row)}</dd>
                  </div>
                ))}
              </dl>
              {actions.length > 0 && (
                <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3">
                  {actions.map((column) => (
                    <div key={column.id}>{column.cell(row)}</div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 md:block">
          <Table aria-label={label}>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => {
                  const active =
                    column.sortKey && sort?.key === column.sortKey ? sort.order : undefined
                  const { sortKey } = column
                  return (
                    <TableHead
                      key={column.id}
                      aria-sort={sortKey ? (ariaSort(active) ?? 'none') : undefined}
                      className={cn(
                        'h-11 px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase',
                        column.align === 'right' && 'text-right',
                        column.className,
                      )}
                    >
                      {sortKey && onSortChange ? (
                        <button
                          type="button"
                          onClick={() => onSortChange(sortKey, active === 'asc' ? 'desc' : 'asc')}
                          className={cn(
                            '-mx-2 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-md px-2 uppercase transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
                            active && 'text-foreground',
                          )}
                        >
                          {column.header}
                          <SortIcon order={active} />
                        </button>
                      ) : column.actions ? (
                        <span className="sr-only">{column.header}</span>
                      ) : (
                        column.header
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        'px-4 py-3 whitespace-normal',
                        column.align === 'right' && 'text-right',
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && (
        <PaginationBar
          meta={pagination.meta}
          onPageChange={pagination.onPageChange}
          disabled={isFetching}
        />
      )}
    </div>
  )
}
