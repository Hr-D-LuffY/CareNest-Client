'use client'

import { RotateCw, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGuardianProfile } from '@/features/guardian/guardian.queries'
import { formatBDT } from '@/lib/format'

// A balance string such as "0" or "0.00" is "no money". Compared, never added.
function hasFunds(balance: string) {
  return Number(balance) > 0
}

// The wallet balance, large, with one line on how the money is used. It reads the guardian profile
// through the query cache, so it updates by itself once a top-up or a booking invalidates it.
export function BalanceCard() {
  const { data, isPending, isError, refetch } = useGuardianProfile()
  const balance = data?.guardianProfile.walletBalance

  return (
    <section
      aria-label="Wallet balance"
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

      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
          <Wallet aria-hidden="true" className="size-4" />
          Wallet balance
        </p>

        {isPending ? (
          <>
            <Skeleton className="h-12 w-48 bg-primary-foreground/20" />
            <Skeleton className="h-5 w-full max-w-md bg-primary-foreground/20" />
          </>
        ) : balance === undefined || isError ? (
          <>
            <p className="font-heading text-5xl tabular-nums sm:text-6xl">—</p>
            <p className="text-base text-primary-foreground/90">
              We could not load your balance. Your money is safe.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-1 h-10 w-fit border-primary-foreground/40 bg-transparent px-4 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground dark:bg-transparent dark:hover:bg-primary-foreground/10"
              onClick={() => refetch()}
            >
              <RotateCw aria-hidden="true" />
              Try again
            </Button>
          </>
        ) : (
          <>
            <p className="font-heading text-5xl tabular-nums sm:text-6xl">{formatBDT(balance)}</p>
            <p className="max-w-xl text-base text-pretty text-primary-foreground/90">
              {hasFunds(balance)
                ? 'A booking needs enough balance to cover its estimated fee. The final care fee is taken when your child checks out, and a ride fare when the trip ends.'
                : 'Your wallet is empty. A booking needs enough balance to cover its estimated fee, so add money before you book a seat.'}
            </p>
          </>
        )}
      </div>
    </section>
  )
}
