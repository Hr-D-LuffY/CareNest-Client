import { TierBadge } from '@/components/shared/tier-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { formatTimeRange } from '@/lib/format'
import type { AssignedBooking } from '@/types'
import { getDateLabel, getTaskPhase } from '../task-model'
import {
  ChildAlerts,
  EmergencyContact,
  TaskActionButton,
  type TaskActions,
  TaskPhaseBadge,
} from './task-parts'

// One child as a card: who, where and when, health notes, emergency contact, and the one action
// that fits (check in, check out, or why there is none).
export function TaskCard({ task, actions }: { task: AssignedBooking; actions: TaskActions }) {
  const phase = getTaskPhase(task, actions.today)
  const showDate = task.sessionDate !== actions.today

  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-soft motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2">
      <header className="flex items-start gap-3">
        <UserAvatar name={task.child.name} photo={null} size={40} />
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="font-heading text-base break-words">{task.child.name}</h3>
          <p className="text-xs text-muted-foreground">
            {showDate && `${getDateLabel(task.sessionDate, actions.today)} · `}
            {task.room.name} · {formatTimeRange(task.room.startTime, task.room.endTime)}
          </p>
        </div>
        <TierBadge tier={task.child.tier} />
      </header>
      {phase !== 'ready' && <TaskPhaseBadge task={task} actions={actions} />}
      <ChildAlerts child={task.child} />
      <EmergencyContact child={task.child} />
      <TaskActionButton task={task} actions={actions} className="w-full" />
    </article>
  )
}
