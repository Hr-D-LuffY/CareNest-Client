'use client'

import { DoorOpen, FilterX, Plus, SearchX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { RoomFilters } from '@/features/room/components/room-filters'
import {
  hasRoomFilters,
  parseRoomViewParams,
  ROOM_FILTER_KEYS,
  toRoomListParams,
} from '@/features/room/room.params'
import { useDeleteRoom, useRoomsQuery } from '@/features/room/room.queries'
import { useQueryParams } from '@/hooks/use-query-params'
import type { RoomWithSeats } from '@/types'
import { ADMIN_ROOMS_PAGE_SIZE } from '../admin-room.params'
import { RoomFormDialog } from './room-form-dialog'
import { RoomsTable } from './rooms-table'

type FormState = { open: boolean; room: RoomWithSeats | null }

export function AddRoomButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      className="h-11 bg-cta px-5 text-sm font-semibold text-cta-foreground hover:bg-cta/90"
      onClick={onClick}
    >
      <Plus aria-hidden="true" />
      Add a room
    </Button>
  )
}

// The admin's care rooms: search, filter, sort, page, add, edit and delete. The URL (?q=&tier=&status=
// &day=&date=&sort=&page=) is the single source of truth, the same as on the guardian's room list, so
// a refresh or a shared link shows the same rooms. The server page has already prefetched the first
// load. Deleting is optimistic: the room goes at once and comes back if the backend refuses.
export function RoomsListView() {
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
  const list = useRoomsQuery(toRoomListParams(params, ADMIN_ROOMS_PAGE_SIZE))
  const deleteRoom = useDeleteRoom()

  const [formState, setFormState] = useState<FormState>({ open: false, room: null })
  const [roomToDelete, setRoomToDelete] = useState<RoomWithSeats | null>(null)

  const { data } = list
  const total = data?.meta.total ?? 0
  const lastPage = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1

  // Deleting the last room on a later page (or a hand-edited ?page=9) leaves an empty page. Step
  // back to the last page that has rooms instead of showing "nothing here".
  useEffect(() => {
    if (data && total > 0 && params.page > lastPage) query.setPage(lastPage)
  }, [data, total, params.page, lastPage, query])

  // `room` is the one being edited, or null to add a new one.
  function openForm(room: RoomWithSeats | null) {
    setFormState({ open: true, room })
  }

  const empty = hasRoomFilters(params) ? (
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
      description="Guardians book seats in care rooms. Add the first one: pick a day and hours, then a verified sitter who works then."
      action={<AddRoomButton onClick={() => openForm(null)} />}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl text-balance md:text-3xl">Care rooms</h1>
            <p className="text-muted-foreground">
              Create the rooms guardians book, and see who runs them and who is waiting for a seat.
            </p>
          </div>
          <AddRoomButton onClick={() => openForm(null)} />
        </header>
      </Reveal>

      <RoomFilters params={params} total={data ? total : undefined} />

      <RoomsTable
        data={data}
        isLoading={list.isPending}
        isFetching={list.isFetching}
        isError={list.isError}
        onRetry={() => list.refetch()}
        onPageChange={query.setPage}
        onEdit={openForm}
        onDelete={setRoomToDelete}
        empty={empty}
      />

      <RoomFormDialog
        open={formState.open}
        onOpenChange={(open) => setFormState((current) => ({ ...current, open }))}
        room={formState.room}
      />

      <ConfirmDialog
        open={roomToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setRoomToDelete(null)
        }}
        title={roomToDelete ? `Delete ${roomToDelete.name}?` : 'Delete room?'}
        description="The room disappears for guardians. This is refused while children hold upcoming seats or wait in its queue: cancel those first."
        confirmLabel="Delete room"
        cancelLabel="Keep room"
        onConfirm={() => {
          if (roomToDelete) deleteRoom.mutate(roomToDelete)
          setRoomToDelete(null)
        }}
      />
    </div>
  )
}
