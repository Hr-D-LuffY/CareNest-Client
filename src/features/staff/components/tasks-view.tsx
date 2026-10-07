'use client'

import { useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { ListErrorState } from '@/components/shared/list-error-state'
import { useNow } from '@/hooks/use-now'
import { useQueryParams } from '@/hooks/use-query-params'
import { useSession } from '@/hooks/use-session'
import { todayIso } from '@/lib/format'
import { type AssignedBooking, VerificationStatus } from '@/types'
import {
  useBusyTaskIds,
  useCheckIn,
  useCheckOut,
  useStaffAvailabilityQuery,
  useStaffTasksQuery,
} from '../staff.queries'
import { parseTaskDate, TASKS_PARAMS } from '../task.params'
import { toAvailableDays } from '../task-model'
import { CheckOutDialog, type TaskActions } from './task-parts'
import { TaskBoardSkeleton } from './task-skeleton'
import { TaskBoard } from './task-week-board'

// The sitter's task board. The chosen day lives in the URL (?date=), so a refresh or a shared link
// shows the same day. The server page has already prefetched the lists. Check-in and check-out are
// optimistic: the child moves at once and comes back if the backend refuses.
export function TasksView({ staffId }: { staffId: string | undefined }) {
  const query = useQueryParams()
  const session = useSession()
  const today = todayIso()
  const now = useNow()

  const tasks = useStaffTasksQuery(TASKS_PARAMS)
  const availability = useStaffAvailabilityQuery(staffId)
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()
  const busyIds = useBusyTaskIds()
  const [taskToCheckOut, setTaskToCheckOut] = useState<AssignedBooking | null>(null)

  const all = tasks.data?.items ?? []
  const total = tasks.data?.meta.total ?? 0
  // No ?date= means today. Today stays the default even when it is empty, so finishing the last
  // check-out does not make the board jump to another day. The empty state points to the next class.
  const selected = parseTaskDate(query.get('date')) ?? today

  const actions: TaskActions = {
    today,
    now,
    // The backend does not gate these on verification, but an unverified account is not meant to
    // take bookings yet (the banner above says so).
    canAct: session.verificationStatus === VerificationStatus.VERIFIED,
    busyIds,
    onCheckIn: (task) => checkIn.mutate(task),
    onCheckOut: setTaskToCheckOut,
  }

  function selectDate(value: string) {
    // Today is the default, so it needs no ?date= in the URL.
    query.set({ date: value === today ? undefined : value })
  }

  function renderBoard() {
    if (tasks.isPending) return <TaskBoardSkeleton />
    if (tasks.isError && !tasks.data) return <ListErrorState onRetry={() => tasks.refetch()} />

    return (
      <>
        <TaskBoard
          tasks={all}
          actions={actions}
          availableDays={toAvailableDays(availability.data)}
          selected={selected}
          onSelect={selectDate}
        />
        {total > all.length && (
          <p className="text-sm text-muted-foreground">
            Showing your next {all.length} of {total} sessions.
          </p>
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-balance md:text-3xl">Tasks</h1>
          <p className="text-muted-foreground">
            See who is coming and check each child in when they arrive and out when they leave. A
            check-out charges the guardian&apos;s wallet for the time used.
          </p>
        </header>
      </Reveal>

      {renderBoard()}

      <CheckOutDialog
        task={taskToCheckOut}
        onOpenChange={(open) => {
          if (!open) setTaskToCheckOut(null)
        }}
        onConfirm={(task) => {
          checkOut.mutate(task)
          setTaskToCheckOut(null)
        }}
      />
    </div>
  )
}
