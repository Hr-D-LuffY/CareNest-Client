import { CircleCheck } from 'lucide-react'
import { TierBadge } from '@/components/shared/tier-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { formatTimeRange } from '@/lib/format'
import type { AssignedBooking } from '@/types'
import { countPhases, getDateLabel, getTaskPhase, groupSessions } from '../task-model'
import {
  ChildAlerts,
  EmergencyContact,
  TaskActionButton,
  type TaskActions,
  TaskPhaseBadge,
} from './task-parts'

function RollCallRow({ task, actions }: { task: AssignedBooking; actions: TaskActions }) {
  const phase = getTaskPhase(task, actions.today)

  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <UserAvatar name={task.child.name} photo={null} size={40} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-heading text-base break-words">{task.child.name}</h3>
            <TierBadge tier={task.child.tier} />
            {phase !== 'ready' && <TaskPhaseBadge task={task} actions={actions} />}
          </div>
          <ChildAlerts child={task.child} />
          <EmergencyContact child={task.child} />
        </div>
      </div>
      <div className="sm:w-44 sm:shrink-0">
        <TaskActionButton task={task} actions={actions} className="w-full" />
      </div>
    </li>
  )
}

// A roll call per room: every child booked into a room on a day sits in one list, under a header
// that says who is still to arrive and who is here. Children already in care are not listed (they
// have their own panel), but the header still counts them, so "2 in care · 3 to arrive" stays true.
export function TaskRollCall({
  tasks,
  actions,
}: {
  tasks: readonly AssignedBooking[]
  actions: TaskActions
}) {
  return (
    <div className="flex flex-col gap-5">
      {groupSessions(tasks).map((session) => {
        const counts = countPhases(session.tasks, actions.today)
        const total = session.tasks.length
        const here = counts['in-care']
        const rows = session.tasks.filter((task) => getTaskPhase(task, actions.today) !== 'in-care')
        const stats = [
          {
            count: here,
            label: 'in care',
            show: here > 0 || session.sessionDate === actions.today,
          },
          { count: counts.ready, label: 'to arrive', show: counts.ready > 0 },
          { count: counts.upcoming, label: 'booked', show: counts.upcoming > 0 },
          { count: counts.missed, label: 'missed', show: counts.missed > 0 },
        ].filter((stat) => stat.show)
        return (
          <section
            key={session.key}
            aria-labelledby={`session-${session.key}`}
            className="overflow-hidden rounded-2xl border bg-card shadow-soft"
          >
            <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b bg-muted/40 px-4 py-3 sm:px-5">
              <div className="flex min-w-0 flex-col">
                <h2 id={`session-${session.key}`} className="font-heading text-lg break-words">
                  {session.room.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {getDateLabel(session.sessionDate, actions.today)} ·{' '}
                  {formatTimeRange(session.room.startTime, session.room.endTime)}
                </p>
              </div>
              <div className="flex flex-col items-start gap-1.5 sm:items-end">
                <p className="text-sm">
                  {stats.map(({ count, label }, index) => (
                    <span key={label}>
                      {index > 0 && ' · '}
                      <span className="font-semibold tabular-nums">{count}</span> {label}
                    </span>
                  ))}
                </p>
                <div
                  aria-hidden="true"
                  className="h-1.5 w-40 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-success transition-[width] duration-300"
                    style={{ width: `${Math.round((here / total) * 100)}%` }}
                  />
                </div>
              </div>
            </header>
            {rows.length === 0 ? (
              <p className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground sm:px-5">
                <CircleCheck aria-hidden="true" className="size-4 shrink-0 text-success" />
                Everyone has arrived. They are listed under In care.
              </p>
            ) : (
              <ul className="divide-y">
                {rows.map((task) => (
                  <RollCallRow key={task.id} task={task} actions={actions} />
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
