'use client'

import {
  CalendarClock,
  CircleAlert,
  Clock,
  HeartPulse,
  Loader2,
  LogIn,
  LogOut,
  Phone,
  TriangleAlert,
  UserCheck,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { formatActivityTime, formatSessionDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AssignedBooking } from '@/types'
import { formatInCare, getDateLabel, getTaskPhase, type TaskPhase } from '../task-model'

// Everything a card or row needs to show a child's state and offer the right action. The board
// builds it once and every design receives the same object.
export type TaskActions = {
  // "YYYY-MM-DD", the backend's "today".
  today: string
  // null until mounted (see useNow).
  now: number | null
  // False until an admin has verified the staff account.
  canAct: boolean
  // Bookings with a check-in or check-out request still running.
  busyIds: ReadonlySet<string>
  onCheckIn: (task: AssignedBooking) => void
  // Opens the confirmation: a check-out charges the guardian's wallet.
  onCheckOut: (task: AssignedBooking) => void
}

const PHASE_BADGE: Record<TaskPhase, { tone: string; icon: typeof Clock; label: string }> = {
  ready: { tone: 'bg-info-soft text-info', icon: Clock, label: 'Expected today' },
  'in-care': { tone: 'bg-success-soft text-success', icon: UserCheck, label: 'In care' },
  upcoming: { tone: 'bg-muted text-muted-foreground', icon: CalendarClock, label: 'Upcoming' },
  missed: { tone: 'bg-warning-soft text-warning', icon: CircleAlert, label: 'Missed' },
}

// A pill with the child's state. For a child in care it counts the time since check-in.
export function TaskPhaseBadge({
  task,
  actions,
  className,
}: {
  task: AssignedBooking
  actions: TaskActions
  className?: string
}) {
  const phase = getTaskPhase(task, actions.today)
  const { tone, icon: Icon, label } = PHASE_BADGE[phase]
  const text =
    phase === 'in-care' && task.checkinLog
      ? formatInCare(task.checkinLog.checkInAt, actions.now)
      : label

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        tone,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {text}
    </span>
  )
}

// Allergies and conditions are what a sitter must know before anything else, so they get their own
// coloured lines (an icon and the word, never colour alone). Text wraps instead of being cut off.
export function ChildAlerts({
  child,
  className,
}: {
  child: AssignedBooking['child']
  className?: string
}) {
  const { allergies, conditions } = child
  if (!allergies && !conditions) {
    return (
      <p className={cn('text-xs text-muted-foreground', className)}>
        No allergies or conditions on file
      </p>
    )
  }

  return (
    <ul aria-label="Health notes" className={cn('flex flex-col gap-1.5', className)}>
      {allergies && (
        <li className="flex items-start gap-2 rounded-md bg-warning-soft px-2.5 py-1.5 text-xs text-warning">
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <span className="min-w-0 break-words">
            <span className="font-semibold">Allergies:</span> {allergies}
          </span>
        </li>
      )}
      {conditions && (
        <li className="flex items-start gap-2 rounded-md bg-info-soft px-2.5 py-1.5 text-xs text-info">
          <HeartPulse aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <span className="min-w-0 break-words">
            <span className="font-semibold">Conditions:</span> {conditions}
          </span>
        </li>
      )}
    </ul>
  )
}

// A tap-to-call link to the child's emergency contact.
export function EmergencyContact({
  child,
  className,
}: {
  child: AssignedBooking['child']
  className?: string
}) {
  return (
    <a
      href={`tel:${child.emergencyContactPhone.replace(/[^\d+]/g, '')}`}
      className={cn(
        'inline-flex min-h-8 w-fit items-center gap-1.5 rounded-sm text-xs text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50',
        className,
      )}
    >
      <Phone aria-hidden="true" className="size-3.5 shrink-0" />
      <span>
        Emergency: {child.emergencyContactName} ·{' '}
        <span className="tabular-nums">{child.emergencyContactPhone}</span>
      </span>
    </a>
  )
}

// The one action a booking offers right now: "Check in" on the session day, "Check out" once the
// child is in care. A session on another day has no button, only a line that says why.
export function TaskActionButton({
  task,
  actions,
  className,
}: {
  task: AssignedBooking
  actions: TaskActions
  className?: string
}) {
  const phase = getTaskPhase(task, actions.today)

  if (phase === 'upcoming' || phase === 'missed') {
    const Icon = phase === 'upcoming' ? CalendarClock : CircleAlert
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon aria-hidden="true" className="size-4 shrink-0" />
        {phase === 'upcoming'
          ? `Check-in opens ${getDateLabel(task.sessionDate, actions.today)}`
          : 'Session day passed, check-in is closed'}
      </p>
    )
  }

  const checkingIn = phase === 'ready'
  const busy = actions.busyIds.has(task.id)
  const Icon = checkingIn ? LogIn : LogOut

  return (
    <Button
      type="button"
      disabled={busy || !actions.canAct}
      title={actions.canAct ? undefined : 'Available once an admin verifies your account'}
      className={cn(
        'h-11 gap-2 bg-cta px-4 font-semibold text-cta-foreground hover:bg-cta/90',
        className,
      )}
      onClick={() => (checkingIn ? actions.onCheckIn(task) : actions.onCheckOut(task))}
    >
      {busy ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Icon aria-hidden="true" />}
      {busy ? 'Saving…' : checkingIn ? 'Check in' : 'Check out'}
      <span className="sr-only"> {task.child.name}</span>
    </Button>
  )
}

type CheckOutDialogProps = {
  task: AssignedBooking | null
  onOpenChange: (open: boolean) => void
  onConfirm: (task: AssignedBooking) => void
}

// A check-out ends the session and charges the guardian's wallet, which cannot be undone, so it
// asks first. Check-in has no dialog: it can simply be followed by a check-out.
export function CheckOutDialog({ task, onOpenChange, onConfirm }: CheckOutDialogProps) {
  const checkInAt = task?.checkinLog?.checkInAt
  return (
    <AlertDialog open={task !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-info-soft text-info">
            <LogOut aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {task ? `Check out ${task.child.name}?` : 'Check out this child?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {checkInAt && `Checked in ${formatActivityTime(checkInAt)}. `}
            {task && `Session on ${formatSessionDate(task.sessionDate)}. `}
            This ends the session and charges the guardian&apos;s wallet for the time used (hours ×
            your hourly rate × the room&apos;s multiplier). If their wallet is short, nothing is
            charged and the booking is flagged.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-10 px-4">Not yet</AlertDialogCancel>
          <AlertDialogAction
            className="h-10 px-4"
            onClick={() => {
              if (task) onConfirm(task)
            }}
          >
            Check out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
