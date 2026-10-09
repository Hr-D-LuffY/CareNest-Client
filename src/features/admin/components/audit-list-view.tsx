'use client'

import { FilterX, RotateCw, ScrollText, SearchX } from 'lucide-react'
import { useEffect } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterSelect } from '@/components/shared/filter-select'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { cn } from '@/lib/utils'
import { AUDIT_FILTER_KEYS, parseAuditViewParams, toAuditLogListParams } from '../audit.params'
import { useAuditLogsQuery } from '../audit.queries'
import { AUDIT_ENTITIES } from '../audit-entities'
import { AuditTable } from './audit-table'

const ENTITY_OPTIONS = [
  { value: '', label: 'Every record' },
  ...AUDIT_ENTITIES.map(({ value, label }) => ({ value, label })),
]

// The platform's audit trail: who did what, newest first, filtered by the kind of record. The URL
// (?entity=&page=) is the single source of truth for the list, so a refresh or a shared link shows
// the same page. The server page has already prefetched the first load.
export function AuditListView() {
  const query = useQueryParams()
  const params = parseAuditViewParams({ page: query.get('page'), entity: query.get('entity') })
  const list = useAuditLogsQuery(toAuditLogListParams(params))

  const { data } = list
  const total = data?.meta.total ?? 0
  const lastPage = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1
  const filtered = Boolean(params.entity)

  // A hand-edited ?page=99 points past the end. Step back to the last page that has rows.
  useEffect(() => {
    if (data && total > 0 && params.page > lastPage) query.setPage(lastPage)
  }, [data, total, params.page, lastPage, query])

  const empty = filtered ? (
    <EmptyState
      icon={SearchX}
      title="No events for this record type"
      description="Nothing has been logged for this kind of record yet. Clear the filter to see every event."
      action={
        <Button
          type="button"
          variant="outline"
          className="h-10 px-4"
          onClick={() => query.clear(...AUDIT_FILTER_KEYS)}
        >
          <FilterX aria-hidden="true" />
          Clear filter
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={ScrollText}
      title="Nothing has been logged yet"
      description="Bookings, payments, trips, verifications and role changes are recorded here as they happen."
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-balance md:text-3xl">Audit log</h1>
          <p className="max-w-2xl text-muted-foreground">
            A permanent record of what happened on the platform and who did it. Events with no
            person were made by the system itself, such as promoting a child from the waitlist.
          </p>
        </header>
      </Reveal>

      <section
        aria-label="Filter the audit log"
        className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-soft sm:p-5"
      >
        <div className="grid gap-3 sm:max-w-xs">
          <FilterSelect
            label="Record"
            value={params.entity ?? ''}
            options={ENTITY_OPTIONS}
            onChange={(entity) => query.set({ entity })}
          />
        </div>
        <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
          {data ? (
            <p aria-live="polite" className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{total}</span>{' '}
              {total === 1 ? 'event' : 'events'}
              {filtered && ' for this record type'}
            </p>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap items-center gap-2">
            {filtered && (
              <Button
                type="button"
                variant="ghost"
                className="h-10 px-3"
                onClick={() => query.clear(...AUDIT_FILTER_KEYS)}
              >
                <FilterX aria-hidden="true" />
                Clear filter
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 px-3"
              disabled={list.isFetching}
              onClick={() => list.refetch()}
            >
              <RotateCw
                aria-hidden="true"
                className={cn('size-4', list.isFetching && 'motion-safe:animate-spin')}
              />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      <AuditTable
        data={data}
        isLoading={list.isPending}
        isFetching={list.isFetching}
        isError={list.isError}
        onRetry={() => list.refetch()}
        onPageChange={query.setPage}
        empty={empty}
      />
    </div>
  )
}
