'use client'

import { LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSessionQuery } from '@/features/auth/auth.queries'
import { ROLE_HOME_PATH } from '@/lib/constants'
import { cn } from '@/lib/utils'

type AuthActionsProps = {
  // Full-width stacked buttons, for the mobile menu. The default is the compact navbar row.
  stacked?: boolean
  onNavigate?: () => void
}

// These are real links styled as buttons. Base UI's <Button render={<Link />}> would put
// role="button" on the anchor, so a screen reader would announce "Log in" as a button.
// Right side of the public navbar: Log in / Get started, or a Dashboard link once logged in.
// The width is reserved while the session loads, so the navbar never jumps.
export function AuthActions({ stacked = false, onNavigate }: AuthActionsProps) {
  const { data: session, isPending } = useSessionQuery()
  const size = stacked ? 'h-11 w-full' : 'h-10 px-4'

  if (isPending) {
    return <Skeleton className={cn(stacked ? 'h-11 w-full' : 'h-10 w-24 sm:w-44')} />
  }

  if (session) {
    return (
      <Link
        href={ROLE_HOME_PATH[session.role]}
        onClick={onNavigate}
        className={cn(buttonVariants(), size)}
      >
        <LayoutDashboard aria-hidden="true" />
        Dashboard
      </Link>
    )
  }

  return (
    <div className={cn('flex gap-2', stacked && 'flex-col')}>
      <Link
        href="/login"
        onClick={onNavigate}
        className={cn(
          buttonVariants({ variant: stacked ? 'outline' : 'ghost' }),
          size,
          !stacked && 'max-sm:hidden',
        )}
      >
        Log in
      </Link>
      <Link
        href="/register"
        onClick={onNavigate}
        className={cn(buttonVariants(), size, 'bg-cta text-cta-foreground hover:bg-cta/90')}
      >
        Get started
      </Link>
    </div>
  )
}
