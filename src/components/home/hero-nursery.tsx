import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CHAPTERS } from './chapters'
import { NurseryScene } from './nursery-scene'

const RISE =
  'motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:fill-mode-backwards'

// The first screen: the promise on the left, and on the right a little story in a care room. A
// parent hands a baby to the sitter and heads to work, the sitter plays with the baby, and the
// parent comes back (see NurseryScene). The words are plain HTML with a CSS-only entrance, so the
// headline paints at once; only the picture runs in the browser.
export function HeroNursery() {
  return (
    <section aria-label="Introduction" className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_55%_at_75%_35%,color-mix(in_oklch,var(--info)_22%,transparent),transparent),radial-gradient(35%_40%_at_8%_95%,color-mix(in_oklch,var(--brand-care)_14%,transparent),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px)] bg-size-[56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
      />

      <div className="page-container grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:py-16">
        <div className="flex flex-col items-start gap-6">
          <p
            className={cn(
              'inline-flex items-center gap-2 rounded-full border bg-card/70 px-3.5 py-1.5 text-sm font-medium backdrop-blur',
              RISE,
            )}
          >
            <span className="size-2 rounded-full bg-success" aria-hidden="true" />
            Daycare and supervised transport
          </p>

          <h1
            className={cn('text-4xl leading-[1.1] text-balance sm:text-5xl', RISE)}
            style={{ animationDelay: '0.1s' }}
          >
            A safe, simple day for your little one, from{' '}
            <span className="bg-linear-to-r from-info to-success bg-clip-text text-transparent">
              drop-off to pick-up
            </span>
            .
          </h1>

          <p
            className={cn('max-w-xl text-base text-pretty text-muted-foreground sm:text-lg', RISE)}
            style={{ animationDelay: '0.2s' }}
          >
            CareNest is a daycare platform where parents book a seat in a care room run by verified
            sitters, arrange a supervised ride and pay from one wallet. Drop your baby off, get on
            with your day, and know they are in good hands.
          </p>

          <div
            className={cn('flex w-full flex-col gap-3 sm:w-auto sm:flex-row', RISE)}
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              href="/register"
              className={cn(
                buttonVariants(),
                'h-12 w-full bg-cta px-6 text-base font-semibold text-cta-foreground hover:bg-cta/90 sm:w-auto',
              )}
            >
              Create a parent account
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              href={`#${CHAPTERS[0].id}`}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-12 w-full px-6 text-base sm:w-auto',
              )}
            >
              Follow the story
            </Link>
          </div>
        </div>

        <NurseryScene />
      </div>
    </section>
  )
}
