import { CalendarPlus, Wallet } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import type { GuardianOverview } from '@/features/guardian/guardian.server'
import { formatBDT } from '@/lib/format'
import { cn } from '@/lib/utils'

function hasFunds(balance: string) {
  return Number(balance) > 0
}

// The top of the guardian's home: a greeting with the first name large, a line saying what the page
// is, and the wallet balance with the two actions a guardian takes most (top up, book).
export function WelcomeBanner({
  overview,
  firstName,
}: {
  overview: GuardianOverview
  firstName: string | undefined
}) {
  const { profile } = overview
  const balance = profile.ok ? profile.data.guardianProfile.walletBalance : null

  return (
    <section
      aria-label="Welcome and wallet"
      className="relative isolate overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground sm:p-8"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-12 -z-10 size-56 rounded-full bg-primary-foreground/10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -bottom-20 -z-10 size-44 rounded-full bg-primary-foreground/10"
      />

      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex flex-col gap-1.5">
          <p className="text-lg font-medium text-primary-foreground">Welcome back,</p>
          <h1 className="text-5xl leading-tight tracking-tight break-words text-primary-foreground sm:text-6xl">
            {firstName ?? 'there'}
          </h1>
          <p className="mt-1 max-w-md text-base text-pretty text-primary-foreground/90">
            Your children&apos;s sessions, rides and wallet at a glance.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex flex-col md:items-end">
            <p className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
              <Wallet aria-hidden="true" className="size-4" />
              Wallet balance
            </p>
            <p className="font-heading text-4xl tabular-nums">
              {balance === null ? '—' : formatBDT(balance)}
            </p>
            {balance !== null && !hasFunds(balance) && (
              <p className="text-sm text-primary-foreground/80">Top up to book your first seat.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/wallet"
              className={cn(
                buttonVariants(),
                'h-11 bg-primary-foreground px-5 text-sm font-semibold text-primary hover:bg-primary-foreground/90',
              )}
            >
              <Wallet aria-hidden="true" />
              Top up
            </Link>
            <Link
              href="/dashboard/book"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-11 border-primary-foreground/40 bg-transparent px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground dark:bg-transparent dark:hover:bg-primary-foreground/10',
              )}
            >
              <CalendarPlus aria-hidden="true" />
              Book a seat
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
