'use client'

import { Check, ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'

const STEPS = [
  'An admin creates the account',
  'The sitter uploads a verification document',
  'An admin verifies it',
] as const

// Ticks (1.3 s each): 0 nothing done, 1-3 the steps tick in, then the finished state holds for a
// few ticks before the loop starts again.
const TICK_MS = 1300
const LOOP_LENGTH = 7

// A staff account on its way to being verified. It runs only while on screen and loops, so the
// status flips from "Unverified" to "Verified" in front of the visitor. The two statuses and their
// order are the app's own (UNVERIFIED -> VERIFIED). With reduced motion it shows the finished state.
export function VerificationCard() {
  const reduce = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.5 })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (reduce || !inView) return
    const timer = setInterval(() => setTick((current) => (current + 1) % LOOP_LENGTH), TICK_MS)
    return () => clearInterval(timer)
  }, [reduce, inView])

  const done = reduce ? STEPS.length : Math.min(tick, STEPS.length)
  const verified = done === STEPS.length

  return (
    <div ref={ref} className="rounded-3xl border bg-card p-6 shadow-card sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-success-soft text-success">
            <ShieldCheck aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="font-heading text-lg">A sitter account</p>
            <p className="text-sm text-muted-foreground">Staff status</p>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={verified ? 'verified' : 'unverified'}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-semibold',
              verified ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning',
            )}
          >
            {verified ? 'Verified' : 'Unverified'}
          </motion.span>
        </AnimatePresence>
      </div>

      <ol className="mt-6 flex flex-col gap-3">
        {STEPS.map((step, index) => {
          const ticked = done > index
          return (
            <li
              key={step}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-4 py-3 text-base transition-colors duration-300',
                ticked ? 'bg-background' : 'bg-muted/40 text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full border transition-colors duration-300',
                  ticked ? 'border-success bg-success text-background' : 'bg-background',
                )}
              >
                <motion.span
                  animate={{ scale: ticked ? 1 : 0, opacity: ticked ? 1 : 0 }}
                  transition={
                    reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 18 }
                  }
                  className="grid place-items-center"
                >
                  <Check aria-hidden="true" className="size-4" strokeWidth={3} />
                </motion.span>
              </span>
              {step}
            </li>
          )
        })}
      </ol>

      <p
        aria-live="polite"
        className={cn(
          'mt-5 text-sm font-medium transition-colors duration-300',
          verified ? 'text-success' : 'text-muted-foreground',
        )}
      >
        {verified ? 'This sitter can now take bookings.' : 'Not able to take bookings yet.'}
      </p>
    </div>
  )
}
