import { ClipboardCheck, ShieldCheck, UsersRound } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from '@/components/motion/reveal'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BentoCard } from './bento-card'
import { CareScene } from './care-scene'

const DEMO_ROLES = [
  { icon: UsersRound, label: 'Guardian', tone: 'bg-info-soft text-info' },
  { icon: ClipboardCheck, label: 'Staff', tone: 'bg-success-soft text-success' },
  { icon: ShieldCheck, label: 'Admin', tone: 'bg-warning-soft text-warning' },
] as const

// Closing call to action: the ask is the wide tile, the one-click demo accounts are the small one.
export function FinalCta() {
  return (
    <section className="page-container pb-16 sm:pb-24">
      <Reveal className="grid gap-4 lg:grid-cols-3">
        <BentoCard featured className="flex flex-col justify-center py-10 lg:col-span-2 lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_0%_0%,color-mix(in_oklch,var(--info)_18%,transparent),transparent),radial-gradient(40%_60%_at_100%_100%,color-mix(in_oklch,var(--brand-care)_14%,transparent),transparent)]"
          />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.1fr_1fr]">
            <div>
              <h2 className="max-w-xl text-3xl text-balance sm:text-4xl">
                Ready to book your child&apos;s first seat?
              </h2>
              <p className="mt-3 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
                Create a guardian account in a minute and book a seat, or join the waitlist if the
                room is full.
              </p>
              <Link
                href="/register"
                className={cn(
                  buttonVariants(),
                  'mt-8 h-12 bg-cta px-6 text-base font-semibold text-cta-foreground hover:bg-cta/90',
                )}
              >
                Get started
              </Link>
            </div>
            <div className="hidden justify-center md:flex">
              <CareScene />
            </div>
          </div>
        </BentoCard>

        <BentoCard className="flex flex-col justify-between gap-6">
          <div>
            <h3 className="text-xl">Look around first</h3>
            <p className="mt-1.5 text-sm text-pretty text-muted-foreground">
              The log in page has one-click demo accounts for every role.
            </p>
          </div>
          <ul className="flex flex-col gap-2.5">
            {DEMO_ROLES.map(({ icon: Icon, label, tone }) => (
              <li key={label} className="flex items-center gap-3 text-sm font-medium">
                <span className={cn('grid size-9 place-items-center rounded-xl', tone)}>
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: 'outline' }), 'h-11 text-sm font-semibold')}
          >
            Try a demo account
          </Link>
        </BentoCard>
      </Reveal>
    </section>
  )
}
