'use client'

import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, LoaderCircle, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  markBackendAwake,
  markBackendFailed,
  markBackendPending,
  useBackendStatus,
} from '@/hooks/use-backend-status'
import { wakeBackend } from '@/lib/api/client'
import { cn } from '@/lib/utils'

// The backend runs on a free Render instance that falls asleep when idle and takes about a minute to
// wake. This button pings it: a spinner while it wakes, then "Backend Activated" and disabled. A
// failure shows the shared error toast and leaves the button ready to try again.
//
// Hover: the fill rises from the bottom and the label rolls up out of the way for a copy of itself
// (both only transform, so they stay cheap).
type ActivateBackendButtonProps = {
  // nav: compact, for the navbar. stacked: full width, for the mobile menu.
  size?: 'nav' | 'stacked'
  className?: string
}

const SIZE_CLASS = {
  nav: 'h-10 px-4 text-sm',
  stacked: 'h-11 w-full text-sm',
} as const

export function ActivateBackendButton({ size = 'nav', className }: ActivateBackendButtonProps) {
  // The status lives outside this component, so it survives page changes (the navbar remounts when
  // you move between the public and auth layouts) and reloads.
  const status = useBackendStatus()
  const wake = useMutation({
    mutationFn: wakeBackend,
    onMutate: markBackendPending,
    onSuccess: markBackendAwake,
    onError: markBackendFailed,
  })

  const pending = status === 'pending'
  const activated = status === 'activated'
  const idle = !pending && !activated

  const label = activated ? 'Backend Activated' : pending ? 'Activating…' : 'Activate Backend'
  const Icon = activated ? CheckCircle2 : pending ? LoaderCircle : Power
  const content = (
    <span className="flex h-6 items-center justify-center gap-2">
      <Icon
        aria-hidden="true"
        className={cn('size-4', pending && 'animate-spin motion-reduce:animate-none')}
      />
      {label}
    </span>
  )

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={!idle}
        aria-busy={pending}
        onClick={() => wake.mutate()}
        className={cn(
          'group relative overflow-hidden font-semibold',
          SIZE_CLASS[size],
          activated &&
            'border-success/40 bg-success-soft text-success disabled:opacity-100 dark:bg-success-soft dark:text-success',
          pending && 'disabled:opacity-80',
          className,
        )}
      >
        {/* Fill that rises from the bottom on hover. */}
        {idle && (
          <span
            aria-hidden="true"
            className="absolute inset-0 translate-y-full bg-primary transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none"
          />
        )}
        {/* Two copies of the label, stacked: the second one (on the fill) rolls in from below. */}
        <span className="relative block h-6 overflow-hidden">
          <span
            className={cn(
              'flex flex-col transition-transform duration-300 ease-out motion-reduce:transition-none',
              idle && 'group-hover:-translate-y-1/2 group-focus-visible:-translate-y-1/2',
            )}
          >
            {content}
            {idle && <span className="text-primary-foreground">{content}</span>}
          </span>
        </span>
      </Button>
      <output className="sr-only">
        {activated
          ? 'Backend activated.'
          : pending
            ? 'Activating the backend, this can take about a minute.'
            : ''}
      </output>
    </>
  )
}
