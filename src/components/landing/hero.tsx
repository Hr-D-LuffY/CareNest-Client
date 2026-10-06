import { Check } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { HeroOrbit } from './hero-orbit'

const REASSURANCES = [
  'Verified sitters and drivers',
  'A waitlist instead of a dead end',
  'Every ride tied to a booking',
  'Top up your wallet with bKash',
] as const

// First screen. The text is plain HTML with a CSS-only entrance (no JavaScript needed to show it),
// so the headline paints at once. Only the illustration on the right runs client-side.
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Soft colour behind the illustration, and a faint grid that fades out toward the edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_55%_at_75%_30%,color-mix(in_oklch,var(--info)_22%,transparent),transparent),radial-gradient(35%_40%_at_10%_90%,color-mix(in_oklch,var(--brand-care)_14%,transparent),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_16%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_16%,transparent)_1px,transparent_1px)] bg-size-[56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
      />

      <div className="page-container grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:py-28">
        <div className="flex flex-col items-start gap-6 motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in motion-safe:slide-in-from-bottom-3">
          <p className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3.5 py-1.5 text-sm font-medium backdrop-blur">
            <span aria-hidden="true" className="size-2 rounded-full bg-success" />
            Childcare and supervised transport
          </p>

          <h1 className="text-4xl text-balance sm:text-5xl lg:text-6xl">
            Trusted care for little ones, from <span className="whitespace-nowrap">drop-off</span>{' '}
            to{' '}
            <span className="whitespace-nowrap bg-linear-to-r from-info to-success bg-clip-text text-transparent">
              pick-up
            </span>
            .
          </h1>

          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            Book a seat in a care room run by verified staff, request a supervised ride and pay from
            one wallet. When a room is full, the smart waitlist keeps your place and promotes your
            child the moment a seat opens.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/register"
              className={cn(
                buttonVariants(),
                'h-12 px-6 text-base font-semibold bg-cta text-cta-foreground hover:bg-cta/90',
              )}
            >
              Get started
            </Link>
            <Link
              href="#how-it-works"
              className={cn(buttonVariants({ variant: 'outline' }), 'h-12 px-6 text-base')}
            >
              See how it works
            </Link>
          </div>

          <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
            {REASSURANCES.map((text) => (
              <li key={text} className="flex items-center gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                  <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <HeroOrbit />
        </div>
      </div>
    </section>
  )
}
