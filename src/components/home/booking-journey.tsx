'use client'

import {
  Check,
  ClipboardCheck,
  DoorOpen,
  House,
  type LucideIcon,
  Pause,
  Play,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { TRANSPORT_BASE_FARE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useTabs } from './use-tabs'

type Stage = {
  id: string
  label: string
  headline: string
  parent: string
  staff: string
  admin: string
}

// One booking, five stages. Each line says what that person sees at that stage and is something the
// app really does (see /services and docs/API.md).
const STAGES: readonly Stage[] = [
  {
    id: 'booked',
    label: 'Booked',
    headline: 'A seat is held for the session',
    parent:
      'Pick a child, a room and a session date. A free seat is confirmed with its estimated fee. A full room puts the child on the waitlist with a priority score instead.',
    staff: 'The sitter who runs the room sees the booking on their task board for that day.',
    admin: 'Admins can open the room and see its bookings and its ranked waitlist.',
  },
  {
    id: 'ride',
    label: 'Ride',
    headline: 'A supervised ride, if one is needed',
    parent: `Add a ride to the booking, choose one of the drivers' vehicles and enter the two addresses. Your wallet needs at least ${TRANSPORT_BASE_FARE} BDT.`,
    staff:
      'The driver starts and ends the trip. The fare is the base fare plus the minutes driven at their per-minute rate.',
    admin: 'Trips and fares are recorded in the audit log.',
  },
  {
    id: 'checked-in',
    label: 'Checked in',
    headline: 'The session starts',
    parent: 'Your child is with the sitter. Your booking stays confirmed.',
    staff:
      'The sitter checks the child in. That is only possible on the session date, and only once.',
    admin: 'Admins can follow the activity in the audit log.',
  },
  {
    id: 'checked-out',
    label: 'Picked up',
    headline: 'The session ends',
    parent:
      'The booking is completed and shows the final fee, worked out from the real time in the room and taken from your wallet.',
    staff: 'The sitter checks the child out. The fee is hours × hourly rate × the room multiplier.',
    admin: 'The fee counts toward the revenue in the analytics.',
  },
  {
    id: 'rated',
    label: 'Rated',
    headline: 'The day gets a rating',
    parent:
      'Rate the sitter from 1 to 5 stars with an optional comment, and the driver too if there was a ride.',
    staff: 'The rating shows on their ratings and earnings pages.',
    admin: "Admins see every staff member's ratings on their staff page.",
  },
]

type Scene = {
  // Where the child's dot sits, as a transform offset from the care room in px.
  dot: { x: number; y: number; opacity: number }
  chip: { label: string; tone: string }
  feed: readonly string[]
}

// What the example booking looks like at each stage. A drawing of the interface with no real person
// or place in it.
const SCENES: readonly Scene[] = [
  {
    dot: { x: -118, y: -62, opacity: 0 },
    chip: { label: 'Confirmed', tone: 'bg-success-soft text-success' },
    feed: ['Booking created', 'Seat confirmed, estimated fee shown'],
  },
  {
    dot: { x: -52, y: -28, opacity: 1 },
    chip: { label: 'Ride in progress', tone: 'bg-warning-soft text-warning' },
    feed: ['Ride requested for this booking', 'Driver started the trip'],
  },
  {
    dot: { x: 0, y: -2, opacity: 1 },
    chip: { label: 'Checked in', tone: 'bg-info-soft text-info' },
    feed: ['Driver ended the trip', 'Sitter checked the child in'],
  },
  {
    dot: { x: 0, y: -2, opacity: 1 },
    chip: { label: 'Completed', tone: 'bg-success-soft text-success' },
    feed: ['Sitter checked the child out', 'Final fee taken from the wallet'],
  },
  {
    dot: { x: 118, y: 62, opacity: 0.35 },
    chip: { label: 'Completed and rated', tone: 'bg-secondary text-secondary-foreground' },
    feed: ['Parent rated the sitter', 'Booking complete'],
  },
]

const VIEWS: readonly { key: 'parent' | 'staff' | 'admin'; title: string; icon: LucideIcon }[] = [
  { key: 'parent', title: 'Parent', icon: UsersRound },
  { key: 'staff', title: 'Sitter or driver', icon: ClipboardCheck },
  { key: 'admin', title: 'Admin', icon: ShieldCheck },
]

const STAGE_MS = 3600
const LOOP = Number.POSITIVE_INFINITY

// Follow one booking through its five stages. A row of stages (click, or use the arrow keys) with
// what each kind of person sees underneath, and a drawing of the booking on the right that changes
// with it. It plays by itself while it is on screen, until you pick a stage or press pause.
export function BookingJourney() {
  const reduce = usePrefersReducedMotion()
  const { index, setIndex, onKeyDown, setTabRef } = useTabs(STAGES.length)
  const [playing, setPlaying] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { margin: '-80px' })
  const running = playing && visible && !reduce
  const stage = STAGES[index] ?? STAGES[0]
  const scene = SCENES[index] ?? SCENES[0]

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setIndex((current) => (current + 1) % STAGES.length), STAGE_MS)
    return () => clearInterval(timer)
  }, [running, setIndex])

  if (!stage || !scene) return null

  return (
    <div
      ref={ref}
      className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14"
    >
      <div className="flex flex-col gap-6">
        <div
          role="tablist"
          aria-label="Stages of a booking"
          onKeyDown={onKeyDown}
          className="grid grid-cols-5 gap-1.5 sm:gap-2"
        >
          {STAGES.map((item, position) => {
            const selected = position === index
            return (
              <button
                key={item.id}
                ref={setTabRef(position)}
                type="button"
                role="tab"
                id={`stage-tab-${item.id}`}
                aria-selected={selected}
                aria-controls="stage-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  setPlaying(false)
                  setIndex(position)
                }}
                className={cn(
                  'relative flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border px-1 py-2 text-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                  selected ? 'border-primary bg-card shadow-card' : 'bg-background hover:bg-card',
                )}
              >
                <span
                  className={cn(
                    'grid size-7 place-items-center rounded-full text-xs font-semibold',
                    selected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {position + 1}
                </span>
                <span
                  className={cn(
                    'text-[11px] leading-tight sm:text-sm',
                    selected ? 'font-semibold' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </span>
                {selected && running && (
                  <motion.span
                    key={`${item.id}-timer`}
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1 origin-left bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: STAGE_MS / 1000, ease: 'linear' }}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div id="stage-panel" role="tabpanel" aria-labelledby={`stage-tab-${stage.id}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
            >
              <h4 className="text-2xl">{stage.headline}</h4>
              <ul className="mt-4 flex flex-col gap-3">
                {VIEWS.map(({ key, title, icon: Icon }) => (
                  <li key={key} className="flex gap-3 rounded-2xl border bg-card p-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
                        {stage[key]}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>

        {!reduce && (
          <button
            type="button"
            onClick={() => setPlaying((current) => !current)}
            className="flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {playing ? (
              <Pause className="size-4" aria-hidden="true" />
            ) : (
              <Play className="size-4" aria-hidden="true" />
            )}
            {playing ? 'Pause animation' : 'Play animation'}
          </button>
        )}
      </div>

      <figure
        aria-label="Example of the booking at the selected stage"
        className="relative mx-auto w-full max-w-sm lg:sticky lg:top-32"
      >
        <div className="relative h-48 overflow-hidden rounded-3xl border bg-card shadow-float">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[32px_32px] opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
          />
          <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
            {[0, 1, 2].map((ring) => (
              <motion.span
                key={ring}
                className="absolute size-24 rounded-full border-2 border-primary"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={
                  reduce || index === 4
                    ? { scale: 1 + ring * 0.5, opacity: 0.15 }
                    : { scale: [0.5, 2.6], opacity: [0.5, 0] }
                }
                transition={
                  reduce || index === 4
                    ? { duration: 0 }
                    : { duration: 3, repeat: LOOP, delay: ring, ease: 'easeOut' }
                }
              />
            ))}
            {/* Home, up and to the left of the care room. */}
            <span className="absolute grid size-8 -translate-x-[118px] -translate-y-[62px] place-items-center rounded-full border bg-card text-muted-foreground">
              <House className="size-4" />
            </span>
            <span className="relative grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-card">
              <DoorOpen className="size-5" />
            </span>
            <motion.span
              className="absolute size-5 rounded-full border-2 border-card bg-success shadow-card"
              animate={scene.dot}
              transition={{ duration: reduce ? 0 : 1.2, ease: 'easeInOut' }}
            />
          </div>
          <span className="absolute top-3 right-3 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Example
          </span>
        </div>

        <div className="relative z-10 mx-3 -mt-8 rounded-2xl border bg-card p-4 shadow-float">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <DoorOpen className="size-4 text-info" aria-hidden="true" />A care booking
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={scene.chip.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: reduce ? 0 : 0.2 }}
                className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', scene.chip.tone)}
              >
                {scene.chip.label}
              </motion.span>
            </AnimatePresence>
          </div>

          <ol className="relative mt-5 grid grid-cols-5">
            <span
              aria-hidden="true"
              className="absolute top-3.5 right-[10%] left-[10%] h-0.5 -translate-y-1/2 bg-border"
            />
            <motion.span
              aria-hidden="true"
              className="absolute top-3.5 right-[10%] left-[10%] h-0.5 origin-left -translate-y-1/2 bg-success"
              animate={{ scaleX: index / (STAGES.length - 1) }}
              transition={{ duration: reduce ? 0 : 0.6, ease: 'easeInOut' }}
            />
            {STAGES.map((item, position) => {
              const done = position < index
              const active = position === index
              return (
                <li key={item.id} className="relative flex flex-col items-center gap-1 text-center">
                  <span
                    className={cn(
                      'grid size-7 place-items-center rounded-full border-2 bg-card text-[11px] font-semibold transition-colors',
                      done && 'border-success bg-success text-background',
                      active && 'border-primary bg-primary text-primary-foreground',
                      !done && !active && 'border-border text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="size-3.5" aria-hidden="true" /> : position + 1}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] leading-tight',
                      active ? 'font-semibold' : 'text-muted-foreground',
                    )}
                  >
                    {item.label}
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="mt-4 flex min-h-20 flex-col justify-end gap-1.5" aria-hidden="true">
            <AnimatePresence initial={false} mode="popLayout">
              {scene.feed.map((line, position) => (
                <motion.p
                  key={line}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : position * 0.08 }}
                  className="flex w-fit max-w-full items-center gap-2 rounded-xl bg-muted px-3 py-1.5 text-sm"
                >
                  <Check className="size-3.5 shrink-0 text-success" />
                  {line}
                </motion.p>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </figure>
    </div>
  )
}
