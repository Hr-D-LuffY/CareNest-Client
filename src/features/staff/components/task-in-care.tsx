import { UserCheck } from 'lucide-react'
import type { AssignedBooking } from '@/types'
import { TaskCard } from './task-card'
import type { TaskActions } from './task-parts'

// Everyone in the sitter's care right now, whatever day the calendar shows: a child who is here
// always has to be checked out, so they are never hidden by picking another day.
export function InCarePanel({
  tasks,
  actions,
}: {
  tasks: readonly AssignedBooking[]
  actions: TaskActions
}) {
  return (
    <section
      aria-labelledby="in-care-heading"
      className="flex flex-col gap-3 rounded-2xl bg-muted/50 p-3"
    >
      <header className="flex items-start gap-3 px-1 pt-1">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-success shadow-soft"
        >
          <UserCheck className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 id="in-care-heading" className="font-heading text-base">
            In care
          </h2>
          <p className="text-xs text-muted-foreground">Check out when they are picked up.</p>
        </div>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-card px-2 text-xs font-semibold tabular-nums">
          {tasks.length}
          <span className="sr-only"> children</span>
        </span>
      </header>

      {tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Nobody is in your care right now.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} actions={actions} />
          ))}
        </div>
      )}
    </section>
  )
}
