'use client'

import { ArrowLeft, CalendarClock, Hourglass, Pencil, Trash2, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ListErrorState } from '@/components/shared/list-error-state'
import { TierBadge } from '@/components/shared/tier-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { RoomRosterPanel } from '@/features/booking/components/room-roster-panel'
import { RoomInfo } from '@/features/room/components/room-info'
import { SeatMeter } from '@/features/room/components/room-seat-meter'
import { useDeleteRoom, useRoomQuery } from '@/features/room/room.queries'
import { RoomWaitlistPanel } from '@/features/waitlist/components/room-waitlist-panel'
import { DAY_LABEL, STAFF_TYPE_LABEL } from '@/lib/constants'
import { formatBDT, formatSessionDate, formatTimeRange } from '@/lib/format'
import { BRAND_SURFACE, FRESH_SURFACE, SOFT_SURFACE } from '@/lib/surfaces'
import { cn } from '@/lib/utils'
import type { RoomWithSeats } from '@/types'
import { RoomDetailSkeleton } from './room-detail-skeleton'
import { RoomFormDialog } from './room-form-dialog'

function SeatsCard({ room }: { room: RoomWithSeats }) {
  return (
    <section
      aria-labelledby="room-seats-heading"
      className={cn(SOFT_SURFACE, 'flex flex-col gap-3 rounded-2xl p-4')}
    >
      <h2 id="room-seats-heading" className="text-lg">
        Next session
      </h2>
      <p className="-mt-1 text-sm text-muted-foreground">
        {DAY_LABEL[room.dayOfWeek]}, {formatSessionDate(room.sessionDate)}
      </p>
      <SeatMeter room={room} showWaitlistNote={false} />
    </section>
  )
}

function RunByCard({ room }: { room: RoomWithSeats }) {
  const { staff } = room
  return (
    <section
      aria-labelledby="room-staff-heading"
      className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-soft"
    >
      <h2 id="room-staff-heading" className="text-lg">
        Run by
      </h2>
      <div className="flex items-center gap-3">
        <UserAvatar name={staff.user.name} photo={null} size={48} />
        <div className="flex min-w-0 flex-col">
          <p className="font-heading leading-tight break-words">{staff.user.name}</p>
          <p className="text-sm text-muted-foreground">
            {STAFF_TYPE_LABEL[staff.staffType]}
            {staff.hourlyRate !== null && ` · ${formatBDT(staff.hourlyRate)}/hour`}
          </p>
        </div>
      </div>
      <Link
        href={`/admin/staff/${staff.id}`}
        className="w-fit rounded-md text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        View staff profile
      </Link>
    </section>
  )
}

// One care room, for the admin: its schedule and size, who runs it, the seats left, the children
// booked into each session and the ranked waitlist, with edit and delete. The server page has already loaded the room and the first page of
// the queue, so this normally renders with data.
export function RoomDetailView({ id }: { id: string }) {
  const router = useRouter()
  const { data: room, isPending, isError, refetch } = useRoomQuery(id, undefined)
  const deleteRoom = useDeleteRoom()
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (isPending) return <RoomDetailSkeleton />
  if (isError || !room) {
    return (
      <div className="flex flex-col gap-6">
        <Link
          href="/admin/rooms"
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All rooms
        </Link>
        <ListErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className={cn(BRAND_SURFACE, 'flex flex-col gap-5 rounded-2xl p-5 sm:p-6')}>
          <Link
            href="/admin/rooms"
            className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md text-sm text-primary-foreground/80 outline-none hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-primary-foreground/50"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            All rooms
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="flex min-w-0 flex-col gap-2">
              <p className="text-sm font-semibold tracking-wide text-primary-foreground/80 uppercase">
                Care room
              </p>
              <h1 className="text-2xl break-words text-balance md:text-3xl">{room.name}</h1>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-primary-foreground/80">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock aria-hidden="true" className="size-4" />
                  {DAY_LABEL[room.dayOfWeek]}s, {formatTimeRange(room.startTime, room.endTime)}
                </span>
                <TierBadge tier={room.tier} className="bg-background text-foreground" />
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-11 bg-background px-5 text-foreground hover:bg-background/85"
                onClick={() => setEditing(true)}
              >
                <Pencil aria-hidden="true" />
                Edit
                <span className="sr-only"> {room.name}</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-11 bg-background px-5 text-destructive hover:bg-background/85 hover:text-destructive"
                onClick={() => setConfirmingDelete(true)}
              >
                <Trash2 aria-hidden="true" />
                Delete
                <span className="sr-only"> {room.name}</span>
              </Button>
            </div>
          </div>
        </header>
      </Reveal>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <section aria-labelledby="room-roster-heading" className="flex min-w-0 flex-col gap-4">
            <h2 id="room-roster-heading" className="flex items-center gap-2 text-xl">
              <UsersRound aria-hidden="true" className="size-5 text-info" />
              Children in this room
            </h2>
            <RoomRosterPanel room={room} />
          </section>

          <section aria-labelledby="room-waitlist-heading" className="flex min-w-0 flex-col gap-4">
            <h2 id="room-waitlist-heading" className="flex items-center gap-2 text-xl">
              <Hourglass aria-hidden="true" className="size-5 text-info" />
              Waitlist
            </h2>
            <RoomWaitlistPanel roomId={room.id} />
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <SeatsCard room={room} />
          <RunByCard room={room} />
          <RoomInfo room={room} surface={FRESH_SURFACE} compact />
        </div>
      </div>

      <RoomFormDialog open={editing} onOpenChange={setEditing} room={room} />

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title={`Delete ${room.name}?`}
        description="The room disappears for guardians. This is refused while children hold upcoming seats or wait in its queue: cancel those first."
        confirmLabel="Delete room"
        cancelLabel="Keep room"
        pending={deleteRoom.isPending}
        onConfirm={() =>
          deleteRoom.mutate(room, {
            // Back to the list, where the room is already gone.
            onSuccess: () => router.push('/admin/rooms'),
            onSettled: () => setConfirmingDelete(false),
          })
        }
      />
    </div>
  )
}
