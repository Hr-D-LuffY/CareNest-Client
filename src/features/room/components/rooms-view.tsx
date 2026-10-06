'use client'

import { DoorOpen, FilterX, SearchX } from 'lucide-react'
import { useEffect } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { cn } from '@/lib/utils'
import {
  hasRoomFilters,
  parseRoomViewParams,
  ROOM_FILTER_KEYS,
  toRoomListParams,
} from '../room.params'
import { useRoomsQuery } from '../room.queries'
import { RoomCards } from './room-cards'
import { RoomFilters } from './room-filters'
import { RoomListSkeleton } from './room-skeleton'

// Browse the care rooms: search, filter, sort and page. The URL (?q=&tier=&status=&day=&date=
// &sort=&page=) is the single source of truth for the list, so a refresh or a shared link shows
// the same rooms. The server page has already prefetched the first load, so this normally renders
// with data.
export function RoomsView() {
  const query = useQueryParams()
  const params = parseRoomViewParams({
    page: query.get('page'),
    q: query.get('q'),
    tier: query.get('tier'),
    status: query.get('status'),
    day: query.get('day'),
    date: query.get('date'),
    sort: query.get('sort'),
  })
  const { data, isPending, isError, isFetching, refetch } = useRoomsQuery(toRoomListParams(params))

  const items = data?.items ?? []
  const total = data?.meta.total ?? 0
  const lastPage = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1

  // A hand-edited ?page=9 leaves an empty page. Step back to the last page that has rooms instead
  // of showing "nothing here".
  useEffect(() => {
    if (data && total > 0 && params.page > lastPage) query.setPage(lastPage)
  }, [data, total, params.page, lastPage, query])

  function renderList() {
    if (isPending) return <RoomListSkeleton />
    if (isError && !data) return <ListErrorState onRetry={() => refetch()} />

    if (total === 0) {
      return hasRoomFilters(params) ? (
        <EmptyState
          icon={SearchX}
          title="No rooms match"
          description="No care room fits these filters. Loosen a filter, or clear them all to see every room."
          action={
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4"
              onClick={() => query.clear(...ROOM_FILTER_KEYS)}
            >
              <FilterX aria-hidden="true" />
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={DoorOpen}
          title="No care rooms yet"
          description="Care rooms are set up by the CareNest team. Check back soon to book a seat."
        />
      )
    }

    return <RoomCards items={items} />
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-balance md:text-3xl">Care rooms</h1>
          <p className="text-muted-foreground">
            Rooms run by verified staff. A full room puts your child on the waitlist instead of
            turning you away.
          </p>
        </header>
      </Reveal>

      <RoomFilters params={params} total={data ? total : undefined} />

      <div
        aria-busy={isFetching || undefined}
        className={cn('transition-opacity', isFetching && !isPending && 'opacity-60')}
      >
        {renderList()}
      </div>

      {data && items.length > 0 && (
        <PaginationBar meta={data.meta} onPageChange={query.setPage} disabled={isFetching} />
      )}
    </div>
  )
}
