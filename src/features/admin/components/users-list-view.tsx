'use client'

import { FilterX, SearchX, Users } from 'lucide-react'
import { useEffect } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterSelect } from '@/components/shared/filter-select'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { ROLE_LABEL } from '@/lib/constants'
import { Role } from '@/types'
import {
  ADMIN_USER_FILTER_KEYS,
  parseAdminUserViewParams,
  toAdminUserListParams,
} from '../admin-user.params'
import { useAdminUsersQuery } from '../admin-user.queries'
import { UsersTable } from './users-table'

const ROLE_OPTIONS = [
  { value: '', label: 'Any role' },
  { value: Role.GUARDIAN, label: ROLE_LABEL.GUARDIAN },
  { value: Role.STAFF, label: ROLE_LABEL.STAFF },
  { value: Role.ADMIN, label: ROLE_LABEL.ADMIN },
] as const

// Every account on the platform: filter by role and open a profile. The URL (?role=&page=) is
// the single source of truth for the list, so a refresh or a shared link shows the same page. The
// server page has already prefetched the first load.
export function UsersListView() {
  const query = useQueryParams()
  const params = parseAdminUserViewParams({ page: query.get('page'), role: query.get('role') })
  const list = useAdminUsersQuery(toAdminUserListParams(params))

  const { data } = list
  const total = data?.meta.total ?? 0
  const lastPage = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1
  const filtered = Boolean(params.role)

  // A hand-edited ?page=9 points past the end. Step back to the last page that has rows.
  useEffect(() => {
    if (data && total > 0 && params.page > lastPage) query.setPage(lastPage)
  }, [data, total, params.page, lastPage, query])

  const empty = filtered ? (
    <EmptyState
      icon={SearchX}
      title="No users with this role"
      description="Nobody has this role right now. Clear the filter to see every account."
      action={
        <Button
          type="button"
          variant="outline"
          className="h-10 px-4"
          onClick={() => query.clear(...ADMIN_USER_FILTER_KEYS)}
        >
          <FilterX aria-hidden="true" />
          Clear filter
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Users}
      title="No users yet"
      description="Guardians appear here when they register, and staff when you create their accounts."
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-balance md:text-3xl">Users</h1>
          <p className="max-w-2xl text-muted-foreground">
            Every account on CareNest. Roles are set when an account is made, so changing one here
            is only for fixing a mistake.
          </p>
        </header>
      </Reveal>

      <section
        aria-label="Filter users"
        className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-soft sm:p-5"
      >
        <div className="grid gap-3 sm:max-w-xs">
          <FilterSelect
            label="Role"
            value={params.role ?? ''}
            options={ROLE_OPTIONS}
            onChange={(role) => query.set({ role })}
          />
        </div>
        <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
          {data ? (
            <p aria-live="polite" className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{total}</span>{' '}
              {total === 1 ? 'user' : 'users'}
              {filtered && ' with this role'}
            </p>
          ) : (
            <span />
          )}
          {filtered && (
            <Button
              type="button"
              variant="ghost"
              className="h-10 px-3"
              onClick={() => query.clear(...ADMIN_USER_FILTER_KEYS)}
            >
              <FilterX aria-hidden="true" />
              Clear filter
            </Button>
          )}
        </div>
      </section>

      <UsersTable
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
