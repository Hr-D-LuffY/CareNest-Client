'use client'

import { Baby, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { TIER_LABEL } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { type Child, Tier } from '@/types'
import { CHILD_SORTS, parseChildViewParams, toChildListParams } from '../child.params'
import { useChildrenQuery, useDeleteChild } from '../child.queries'
import { ChildCards } from './child-cards'
import { ChildDetailDialog } from './child-detail-dialog'
import { ChildFormDialog } from './child-form-dialog'
import { ChildListSkeleton } from './child-skeleton'

const TIER_FILTERS = [
  { value: undefined, label: 'All' },
  { value: Tier.DAILY, label: TIER_LABEL.DAILY },
  { value: Tier.WEEKLY, label: TIER_LABEL.WEEKLY },
  { value: Tier.MONTHLY, label: TIER_LABEL.MONTHLY },
] as const

type FormState = { open: boolean; child: Child | null }

// The guardian's children: filter by tier, add, edit, delete. The URL (?tier=&page=) is the single
// source of truth for the list, so a refresh or a shared link shows the same page. The server page
// has already prefetched the first load, so this normally renders with data.
export function ChildrenView() {
  const query = useQueryParams()
  const params = parseChildViewParams({
    page: query.get('page'),
    tier: query.get('tier'),
    sort: query.get('sort'),
  })
  const { data, isPending, isError, isFetching, refetch } = useChildrenQuery(
    toChildListParams(params),
  )
  const deleteChild = useDeleteChild()

  const [formState, setFormState] = useState<FormState>({ open: false, child: null })
  const [profile, setProfile] = useState<FormState>({ open: false, child: null })
  const [childToDelete, setChildToDelete] = useState<Child | null>(null)

  const items = data?.items ?? []
  const total = data?.meta.total ?? 0
  const lastPage = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1

  // Deleting the last child on a later page (or a hand-edited ?page=9) leaves an empty page. Step
  // back to the last page that has children instead of showing "nothing here".
  useEffect(() => {
    if (data && total > 0 && params.page > lastPage) query.setPage(lastPage)
  }, [data, total, params.page, lastPage, query])

  // `child` is the one being edited, or null to add a new one.
  function openForm(child: Child | null) {
    setFormState({ open: true, child })
  }

  function openProfile(child: Child) {
    setProfile({ open: true, child })
  }

  function setProfileOpen(open: boolean) {
    setProfile((current) => ({ ...current, open }))
  }

  function renderList() {
    if (isPending) return <ChildListSkeleton />
    if (isError && !data) return <ListErrorState onRetry={() => refetch()} />

    if (total === 0) {
      return params.tier ? (
        <EmptyState
          icon={Baby}
          title={`No ${TIER_LABEL[params.tier].toLowerCase()} children`}
          description="None of your children are on this tier. Show them all, or change a child's tier."
          action={
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4"
              onClick={() => query.clear('tier')}
            >
              Show all children
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Baby}
          title="No children yet"
          description="Add your child's details once. Staff use them to care for your child, and you need a child profile to book a seat."
          action={
            <Button
              type="button"
              className="h-11 bg-cta px-5 font-semibold text-cta-foreground hover:bg-cta/90"
              onClick={() => openForm(null)}
            >
              <UserPlus aria-hidden="true" />
              Add your first child
            </Button>
          }
        />
      )
    }

    return (
      <ChildCards
        items={items}
        onEdit={openForm}
        onDelete={setChildToDelete}
        onView={openProfile}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl text-balance md:text-3xl">Children</h1>
            <p className="text-muted-foreground">
              The children you book care for. Staff see their health notes and emergency contact.
            </p>
          </div>
          <Button
            type="button"
            className="h-11 bg-cta px-5 text-sm font-semibold text-cta-foreground hover:bg-cta/90"
            onClick={() => openForm(null)}
          >
            <UserPlus aria-hidden="true" />
            Add a child
          </Button>
        </header>
      </Reveal>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex min-w-0 flex-wrap gap-2">
          <legend className="sr-only">Filter by care tier</legend>
          {TIER_FILTERS.map(({ value, label }) => {
            const active = params.tier === value
            return (
              <Button
                key={label}
                type="button"
                variant={active ? 'default' : 'outline'}
                aria-pressed={active}
                className="h-10 px-4"
                onClick={() => query.set({ tier: value })}
              >
                {label}
              </Button>
            )
          })}
        </fieldset>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sort by</span>
            <select
              value={params.sort}
              onChange={(event) =>
                query.set({
                  sort: event.target.value === 'newest' ? undefined : event.target.value,
                })
              }
              className="h-10 cursor-pointer rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {CHILD_SORTS.map(({ value, label }) => (
                <option key={value} value={value} className="bg-popover text-popover-foreground">
                  {label}
                </option>
              ))}
            </select>
          </label>
          {data && (
            <p aria-live="polite" className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{total}</span>{' '}
              {total === 1 ? 'child' : 'children'}
            </p>
          )}
        </div>
      </div>

      <div
        aria-busy={isFetching || undefined}
        className={cn('transition-opacity', isFetching && !isPending && 'opacity-60')}
      >
        {renderList()}
      </div>

      {data && items.length > 0 && (
        <PaginationBar meta={data.meta} onPageChange={query.setPage} disabled={isFetching} />
      )}

      <ChildDetailDialog open={profile.open} onOpenChange={setProfileOpen} child={profile.child} />

      <ChildFormDialog
        open={formState.open}
        onOpenChange={(open) => setFormState((current) => ({ ...current, open }))}
        child={formState.child}
      />

      <ConfirmDialog
        open={childToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setChildToDelete(null)
        }}
        title={childToDelete ? `Remove ${childToDelete.name}?` : 'Remove child?'}
        description="Their profile will be removed. A child with an active booking or a waitlist spot cannot be removed: cancel those first."
        confirmLabel="Remove child"
        cancelLabel="Keep child"
        onConfirm={() => {
          if (childToDelete) deleteChild.mutate(childToDelete.id)
          setChildToDelete(null)
        }}
      />
    </div>
  )
}
