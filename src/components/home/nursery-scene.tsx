'use client'

import { Pause, Play } from 'lucide-react'
import { type MotionProps, motion, type TargetAndTransition, useInView } from 'motion/react'
import { type ReactNode, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'

// The hero picture: a small story told in one loop. A parent brings a baby to the care room and
// hands it to the sitter, waves goodbye and leaves for work. The sitter plays with the baby on the
// mat while the sun crosses the window and the clock turns. The parent comes back and picks the baby
// up. A drawing of the idea, with no real person in it.
//
// Every moving part runs one shared timeline of D seconds, as keyframes at fixed times, so they all
// stay in step. Only transform and opacity change. While the scene is off screen, paused, or the
// visitor asked for less motion, every part shows the same resting moment (REST) instead.

const D = 24
const REST = 12.5
const FLOOR = 330

type Key = readonly [seconds: number, value: number]
type Tracks = Record<string, readonly Key[]>

// Linear interpolation between keyframes, for the resting pose.
function valueAt(keys: readonly Key[], at: number) {
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i] as Key
    const [t0, v0] = keys[i - 1] as Key
    if (at <= t1) return t1 === t0 ? v1 : v0 + (v1 - v0) * ((at - t0) / (t1 - t0))
  }
  return (keys[keys.length - 1] as Key)[1]
}

// Motion props for one element: its tracks as looping keyframes, or the resting pose.
function timeline(tracks: Tracks, playing: boolean): MotionProps {
  const entries = Object.entries(tracks)
  if (!playing) {
    return {
      initial: false,
      animate: Object.fromEntries(
        entries.map(([name, keys]) => [name, valueAt(keys, REST)]),
      ) as TargetAndTransition,
      transition: { duration: 0 },
    }
  }
  return {
    animate: Object.fromEntries(
      entries.map(([name, keys]) => [name, keys.map(([, value]) => value)]),
    ) as TargetAndTransition,
    transition: Object.fromEntries(
      entries.map(([name, keys]) => [
        name,
        {
          duration: D,
          ease: 'linear',
          repeat: Number.POSITIVE_INFINITY,
          times: keys.map(([seconds]) => seconds / D),
        },
      ]),
    ),
  }
}

const SWING_STEP = 0.1

// A limb or bob that swings only while a window of time is "walking", easing in and out at its ends.
function swing(
  windows: readonly (readonly [number, number])[],
  amplitude: number,
  phase: number,
  fn: (angle: number) => number = (angle) => Math.sin(angle),
): Key[] {
  const keys: Key[] = []
  for (let s = 0; s <= D + 1e-9; s += SWING_STEP) {
    const at = Math.min(s, D)
    let envelope = 0
    for (const [from, to] of windows) {
      if (at >= from && at <= to)
        envelope = Math.max(envelope, Math.min(1, (at - from) / 0.3, (to - at) / 0.3))
    }
    const value = envelope * amplitude * fn((2 * Math.PI * at) / 0.64 + phase)
    keys.push([Number(at.toFixed(2)), Number(value.toFixed(2))])
  }
  keys[keys.length - 1] = [D, 0]
  return keys
}

// A back-and-forth between two values every `period` seconds inside a window; `rest` outside it.
function oscillate(
  from: number,
  to: number,
  a: number,
  b: number,
  period: number,
  rest: number,
): Key[] {
  const keys: Key[] = []
  let high = true
  for (let s = from; s < to; s += period / 2) {
    keys.push([Number(s.toFixed(2)), high ? a : b])
    high = !high
  }
  keys.push([to, rest])
  return keys
}

// ---------------------------------------------------------------------------------------------
// Timelines (seconds, value).

const WALKS = [
  [0.5, 3.9],
  [7.6, 10.6],
  [14, 17.5],
] as const

const MOTHER_X: Key[] = [
  [0, 80],
  [0.5, 80],
  [3.9, 292],
  [7.6, 292],
  [10.6, 80],
  [14, 80],
  [17.5, 455],
  [D, 455],
]
const MOTHER_FACING_RIGHT: Key[] = [
  [0, 0],
  [0.5, 0],
  [0.9, 1],
  [7.55, 1],
  [7.6, 0],
  [13.95, 0],
  [14.4, 1],
  [D, 1],
]
const MOTHER_FACING_LEFT: Key[] = [
  [0, 0],
  [7.55, 0],
  [7.6, 1],
  [10.2, 1],
  [10.6, 0],
  [D, 0],
]
const MOTHER_BOB: Key[] = swing(WALKS, -2.5, Math.PI / 2, (angle) => Math.abs(Math.sin(angle)))
const MOTHER_LEG_A: Key[] = swing(WALKS, 24, 0)
const MOTHER_LEG_B: Key[] = swing(WALKS, 24, Math.PI)
// Carrying the baby, handing it over, waving goodbye, walking off, reaching down for the baby.
const MOTHER_ARM: Key[] = [
  [0, -75],
  [4.4, -75],
  [5, -92],
  [5.6, -60],
  [6, -140],
  ...oscillate(6.25, 7.5, -118, -140, 0.5, -140),
  [8, 4],
  [17.4, 4],
  [17.9, -28],
  [18.7, -75],
  [D, -75],
]

const BABY_X: Key[] = [
  [0, 112],
  [0.5, 112],
  [3.9, 324],
  [4.4, 324],
  [4.9, 352],
  [5.6, 385],
  [8.2, 385],
  [8.6, 388],
  [9, 448],
  [9.8, 505],
  [17.8, 505],
  [18.4, 498],
  [19, 487],
  [D, 487],
]
const BABY_Y: Key[] = [
  [0, 214],
  [3.9, 214],
  [4.4, 214],
  [4.9, 216],
  [5.6, 226],
  [8.2, 226],
  [8.6, 214],
  [9, 236],
  [9.8, 303],
  [17.8, 303],
  [18.4, 262],
  [19, 214],
  [D, 214],
]
const BABY_OPACITY: Key[] = [
  [0, 0],
  [0.5, 0],
  [0.9, 1],
  [D, 1],
]
// The baby waves at its parent while held, and kicks on the mat.
const BABY_ARM: Key[] = [[0, 0], [5.7, 0], ...oscillate(5.9, 7.6, -130, -105, 0.45, 0), [D, 0]]
const BABY_KICK_A: Key[] = [[0, 0], ...oscillate(10.2, 17, 14, -10, 0.7, 0), [D, 0]]
const BABY_KICK_B: Key[] = [[0, 0], ...oscillate(10.2, 17, -10, 14, 0.7, 0), [D, 0]]

// Sitter arms (degrees, clockwise): hanging, reaching for the baby, cradling it, swinging it over to
// the mat, then shaking a rattle at it.
const SITTER_ARM_LEFT: Key[] = [
  [0, 6],
  [4, 6],
  [4.6, 78],
  [5.2, 78],
  [5.7, -34],
  [8.2, -34],
  [9, -62],
  [9.8, -62],
  [10.4, 8],
  [D, 6],
]
const SITTER_ARM_RIGHT: Key[] = [
  [0, -6],
  [4, -6],
  [4.6, 32],
  [5.2, 32],
  [5.7, 34],
  [8.2, 34],
  [9, -58],
  [9.8, -58],
  [10.4, -62],
  ...oscillate(10.7, 17.2, -48, -62, 0.7, -6).slice(0, -1),
  [18, -6],
  [D, -6],
]
const RATTLE_OPACITY: Key[] = [
  [0, 0],
  [9.8, 0],
  [10.2, 1],
  [17.4, 1],
  [17.8, 0],
  [D, 0],
]

const SCENE_OPACITY: Key[] = [
  [0, 0],
  [0.6, 1],
  [22.4, 1],
  [23.4, 0],
  [D, 0],
]
const SUN_X: Key[] = [
  [0, 560],
  [D, 608],
]
const SUN_Y: Key[] = [
  [0, 124],
  [12, 94],
  [D, 124],
]
const MINUTE_HAND: Key[] = [
  [0, 0],
  [D, 720],
]
const HOUR_HAND: Key[] = [
  [0, 0],
  [D, 60],
]

function heartTracks(start: number): Tracks {
  return {
    opacity: [
      [0, 0],
      [start, 0],
      [start + 0.3, 1],
      [start + 1.5, 0],
      [D, 0],
    ],
    y: [
      [0, 0],
      [start, 0],
      [start + 1.6, -30],
      [D, -30],
    ],
    scale: [
      [0, 0.5],
      [start, 0.5],
      [start + 0.4, 1],
      [D, 1],
    ],
  }
}

// [x, y, start time]: handing over, a kiss goodbye, placing the baby down, the reunion hug.
const HEARTS = [
  [338, 176, 5.1],
  [388, 168, 6],
  [330, 126, 6.9],
  [500, 252, 10],
  [472, 170, 19],
  [500, 164, 20.2],
] as const

const CHIPS = [
  {
    title: 'Drop-off',
    text: 'A parent hands over their little one.',
    keys: [
      [0, 0],
      [0.5, 0],
      [7.6, 1],
      [23.4, 1],
      [23.45, 0],
      [D, 0],
    ],
  },
  {
    title: 'Care',
    text: 'The sitter looks after them while the parent is at work.',
    keys: [
      [0, 0],
      [7.6, 0],
      [17, 1],
      [23.4, 1],
      [23.45, 0],
      [D, 0],
    ],
  },
  {
    title: 'Pick-up',
    text: 'The parent comes back and takes them home.',
    keys: [
      [0, 0],
      [17, 0],
      [22.4, 1],
      [23.4, 1],
      [23.45, 0],
      [D, 0],
    ],
  },
] as const satisfies readonly { title: string; text: string; keys: readonly Key[] }[]

// ---------------------------------------------------------------------------------------------
// Drawing. Characters stand on y = 0 and are moved into the room by the groups around them. A limb
// hangs down from its joint, so rotating around the top centre of its box swings it from the joint.

const JOINT = { originX: 0.5, originY: 0 } as const

type Anim = (tracks: Tracks) => MotionProps

function Heart({ anim, start }: { anim: Anim; start: number }) {
  return (
    <motion.g {...anim(heartTracks(start))}>
      <path
        d="M0 4 C-9 -4 -9 -13 0 -9 C9 -13 9 -4 0 4 Z"
        className="fill-brand-care"
        transform="scale(1.3)"
      />
    </motion.g>
  )
}

function MotherFigure({ anim }: { anim: Anim }) {
  return (
    <g>
      {/* Hair behind the head, then the bun. */}
      <circle cx={-4} cy={-154} r={17.5} className="fill-hair-dark" />
      <circle cx={-15} cy={-168} r={9} className="fill-hair-dark" />
      {/* Legs swing from the hip under the skirt. */}
      <g transform="translate(-7 -62)">
        <motion.g {...anim({ rotate: MOTHER_LEG_B })} style={JOINT}>
          <rect x={-5} y={0} width={10} height={58} rx={5} className="fill-skin-medium" />
          <rect x={-5} y={52} width={14} height={9} rx={4} className="fill-hair-dark" />
        </motion.g>
      </g>
      <g transform="translate(7 -62)">
        <motion.g {...anim({ rotate: MOTHER_LEG_A })} style={JOINT}>
          <rect x={-5} y={0} width={10} height={58} rx={5} className="fill-skin-medium" />
          <rect x={-5} y={52} width={14} height={9} rx={4} className="fill-hair-dark" />
        </motion.g>
      </g>
      <path d="M-15 -98 L15 -98 L26 -60 L-26 -60 Z" className="fill-primary" />
      <rect x={-15} y={-134} width={30} height={42} rx={12} className="fill-warning" />
      {/* The arm that carries a work bag. */}
      <g transform="translate(-3 -126) rotate(6)">
        <rect x={-4.5} y={0} width={9} height={32} rx={4.5} className="fill-warning" />
        <circle cy={33} r={5} className="fill-skin-medium" />
        <path d="M-6 36 Q0 26 6 36" className="fill-none stroke-hair-dark" strokeWidth={2} />
        <rect x={-11} y={36} width={22} height={16} rx={3} className="fill-brand-care" />
      </g>
      <circle cx={2} cy={-153} r={16} className="fill-skin-medium" />
      <path d="M-11 -160 Q3 -174 18 -157 Q6 -163 -11 -160 Z" className="fill-hair-dark" />
      <circle cx={10} cy={-153} r={1.9} className="fill-hair-dark" />
      <path d="M8 -146 Q12 -142 16 -147" className="fill-none stroke-hair-dark" strokeWidth={1.7} />
      <circle cx={13} cy={-148} r={3} className="fill-destructive/25" />
      {/* The arm that carries, hands over and waves. */}
      <g transform="translate(4 -126)">
        <motion.g {...anim({ rotate: MOTHER_ARM })} style={JOINT}>
          <rect x={-4.5} y={0} width={9} height={32} rx={4.5} className="fill-warning" />
          <circle cy={33} r={5} className="fill-skin-medium" />
        </motion.g>
      </g>
    </g>
  )
}

function SitterFigure({ anim }: { anim: Anim }) {
  return (
    <g>
      <rect x={-13} y={-64} width={11} height={56} rx={5} className="fill-brand-nest" />
      <rect x={2} y={-64} width={11} height={56} rx={5} className="fill-brand-nest" />
      <rect x={-15} y={-9} width={15} height={9} rx={4} className="fill-hair-dark" />
      <rect x={0} y={-9} width={15} height={9} rx={4} className="fill-hair-dark" />
      <rect x={-21} y={-140} width={42} height={80} rx={14} className="fill-success" />
      {/* Apron with a pocket. */}
      <rect x={-14} y={-124} width={28} height={62} rx={9} className="fill-primary" />
      <rect x={-8} y={-96} width={16} height={11} rx={3} className="fill-primary-foreground/25" />
      {/* Arms swing from the shoulders. */}
      <g transform="translate(-22 -130)">
        <motion.g {...anim({ rotate: SITTER_ARM_LEFT })} style={JOINT}>
          <rect x={-4.5} y={0} width={9} height={34} rx={4.5} className="fill-success" />
          <circle cy={35} r={5} className="fill-skin-light" />
        </motion.g>
      </g>
      <g transform="translate(22 -130)">
        <motion.g {...anim({ rotate: SITTER_ARM_RIGHT })} style={JOINT}>
          <rect x={-4.5} y={0} width={9} height={34} rx={4.5} className="fill-success" />
          <circle cy={35} r={5} className="fill-skin-light" />
          {/* The rattle in her hand, only while she plays. */}
          <motion.g {...anim({ opacity: RATTLE_OPACITY })}>
            <rect x={-1.5} y={36} width={3} height={14} rx={1.5} className="fill-hair-brown" />
            <circle cy={56} r={7} className="fill-warning" />
            <circle cx={-2} cy={54} r={2} className="fill-background/70" />
          </motion.g>
        </motion.g>
      </g>
      {/* Head, hair and a friendly face. */}
      <circle cy={-160} r={17} className="fill-skin-light" />
      <circle cy={-183} r={8} className="fill-hair-brown" />
      <path
        d="M-18 -158 C-19 -184 19 -184 18 -158 C10 -171 -10 -171 -18 -158 Z"
        className="fill-hair-brown"
      />
      <circle cx={-6} cy={-160} r={1.9} className="fill-hair-dark" />
      <circle cx={6} cy={-160} r={1.9} className="fill-hair-dark" />
      <path d="M-6 -153 Q0 -148 6 -153" className="fill-none stroke-hair-dark" strokeWidth={1.7} />
      <circle cx={-11} cy={-154} r={3} className="fill-destructive/25" />
      <circle cx={11} cy={-154} r={3} className="fill-destructive/25" />
    </g>
  )
}

function BabyFigure({ anim }: { anim: Anim }) {
  return (
    <g>
      {/* Legs kick on the mat. */}
      <g transform="translate(-6 16)">
        <motion.g {...anim({ rotate: BABY_KICK_A })} style={JOINT}>
          <rect x={-4} y={0} width={8} height={12} rx={4} className="fill-skin-light" />
        </motion.g>
      </g>
      <g transform="translate(6 16)">
        <motion.g {...anim({ rotate: BABY_KICK_B })} style={JOINT}>
          <rect x={-4} y={0} width={8} height={12} rx={4} className="fill-skin-light" />
        </motion.g>
      </g>
      <rect x={-11} y={-4} width={22} height={24} rx={9} className="fill-primary/80" />
      <circle cx={0} cy={11} r={1.4} className="fill-primary-foreground/50" />
      {/* One arm waves, the other rests. */}
      <g transform="translate(-12 0) rotate(8)">
        <rect x={-3.5} y={0} width={7} height={14} rx={3.5} className="fill-skin-light" />
      </g>
      <g transform="translate(12 0)">
        <motion.g {...anim({ rotate: BABY_ARM })} style={JOINT}>
          <rect x={-3.5} y={0} width={7} height={14} rx={3.5} className="fill-skin-light" />
        </motion.g>
      </g>
      <circle cy={-16} r={13} className="fill-skin-light" />
      <path
        d="M-3 -29 Q3 -36 8 -29"
        className="fill-none stroke-hair-dark"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <motion.g
        animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{
          duration: 4,
          times: [0, 0.9, 0.94, 0.98, 1],
          repeat: Number.POSITIVE_INFINITY,
        }}
      >
        <ellipse cx={-5} cy={-16} rx={1.8} ry={2.2} className="fill-hair-dark" />
        <ellipse cx={5} cy={-16} rx={1.8} ry={2.2} className="fill-hair-dark" />
      </motion.g>
      <path
        d="M-3.5 -9 Q0 -5.5 3.5 -9"
        className="fill-none stroke-hair-dark"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <circle cx={-9} cy={-11} r={2.8} className="fill-destructive/30" />
      <circle cx={9} cy={-11} r={2.8} className="fill-destructive/30" />
    </g>
  )
}

// The room: wall, window, door to the street, floor, rug, mobile and clock.
function Room({ anim, playing }: { anim: Anim; playing: boolean }) {
  return (
    <>
      <rect width={640} height={FLOOR} className="fill-info-soft/60" />
      <rect y={FLOOR} width={640} height={70} className="fill-muted" />
      <rect y={FLOOR - 4} width={640} height={5} className="fill-border" />

      {/* The door out to the street, ajar onto a bright morning. */}
      <rect
        x={22}
        y={118}
        width={104}
        height={FLOOR - 118}
        rx={8}
        className="fill-background stroke-border"
        strokeWidth={3}
      />
      <rect x={30} y={126} width={88} height={FLOOR - 126} rx={4} className="fill-success-soft" />
      <ellipse cx={62} cy={FLOOR - 4} rx={30} ry={22} className="fill-success/40" />
      <ellipse cx={100} cy={FLOOR - 4} rx={22} ry={16} className="fill-success/30" />
      <rect x={36} y={FLOOR - 2} width={76} height={6} rx={3} className="fill-border" />

      {/* The window; the sun crosses it while the parent is away. */}
      <clipPath id="nursery-window">
        <rect x={548} y={64} width={74} height={92} rx={8} />
      </clipPath>
      <rect x={548} y={64} width={74} height={92} rx={8} className="fill-background" />
      <g clipPath="url(#nursery-window)">
        <motion.g {...anim({ x: SUN_X, y: SUN_Y })}>
          <circle r={11} className="fill-warning" />
        </motion.g>
      </g>
      <rect
        x={548}
        y={64}
        width={74}
        height={92}
        rx={8}
        className="fill-none stroke-border"
        strokeWidth={3}
      />
      <path d="M585 64 V156 M548 110 H622" className="stroke-border" strokeWidth={2} />

      {/* The wall clock: time passes. */}
      <g transform="translate(320 100)">
        <circle r={22} className="fill-card stroke-border" strokeWidth={3} />
        <motion.g {...anim({ rotate: HOUR_HAND })} style={{ originX: 0.5, originY: 1 }}>
          <rect x={-1.5} y={-11} width={3} height={11} rx={1.5} className="fill-foreground" />
        </motion.g>
        <motion.g {...anim({ rotate: MINUTE_HAND })} style={{ originX: 0.5, originY: 1 }}>
          <rect x={-1} y={-16} width={2} height={16} rx={1} className="fill-foreground" />
        </motion.g>
        <circle r={2.5} className="fill-foreground" />
      </g>

      {/* Rug and toys. */}
      <ellipse
        cx={505}
        cy={FLOOR + 4}
        rx={100}
        ry={16}
        className="fill-warning-soft stroke-border"
        strokeWidth={2}
      />
      <rect x={440} y={FLOOR - 10} width={16} height={16} rx={3} className="fill-info" />
      <rect x={456} y={FLOOR - 2} width={13} height={13} rx={3} className="fill-success" />
      <circle cx={566} cy={FLOOR + 6} r={9} className="fill-destructive" />

      {/* A mobile over the rug, swaying. */}
      <motion.g
        animate={playing ? { rotate: [-4, 4] } : { rotate: 0 }}
        transition={
          playing
            ? {
                duration: 2.8,
                ease: 'easeInOut',
                repeat: Number.POSITIVE_INFINITY,
                repeatType: 'reverse',
              }
            : { duration: 0 }
        }
        style={JOINT}
      >
        <path d="M505 0 V64 M470 64 H540" className="fill-none stroke-border" strokeWidth={2} />
        <path
          d="M470 64 V84 M505 64 V92 M540 64 V84"
          className="fill-none stroke-border"
          strokeWidth={1.5}
        />
        <circle cx={470} cy={92} r={8} className="fill-info" />
        <circle cx={505} cy={100} r={8} className="fill-warning" />
        <circle cx={540} cy={92} r={8} className="fill-success" />
      </motion.g>
    </>
  )
}

export function NurseryScene() {
  const reduce = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.3 })
  const [paused, setPaused] = useState(false)
  const playing = inView && !paused && !reduce
  const anim: Anim = (tracks) => timeline(tracks, playing)

  const faces = (opacity: readonly Key[], children: ReactNode, mirrored: boolean) => (
    <motion.g {...anim({ opacity })}>
      {mirrored ? <g transform="scale(-1 1)">{children}</g> : children}
    </motion.g>
  )

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-xl">
      <div className="relative overflow-hidden rounded-3xl border bg-card shadow-float">
        <svg
          viewBox="0 0 640 400"
          role="img"
          aria-label="Illustration: a parent brings their baby to the care room and hands the baby to the sitter. The parent waves goodbye and leaves for work while the sitter plays with the baby. Later the parent comes back and picks the baby up."
          className="block h-auto w-full"
        >
          <Room anim={anim} playing={playing} />

          <motion.g {...anim({ opacity: SCENE_OPACITY })}>
            {/* The parent, seen from the side: walking in, handing over, waving, leaving, returning. */}
            <g transform={`translate(0 ${FLOOR})`}>
              <motion.g {...anim({ x: MOTHER_X })}>
                <motion.g {...anim({ y: MOTHER_BOB })}>
                  {faces(MOTHER_FACING_RIGHT, <MotherFigure anim={anim} />, false)}
                  {faces(MOTHER_FACING_LEFT, <MotherFigure anim={anim} />, true)}
                </motion.g>
              </motion.g>
            </g>

            <g transform={`translate(385 ${FLOOR})`}>
              <SitterFigure anim={anim} />
            </g>

            <motion.g {...anim({ x: BABY_X, y: BABY_Y, opacity: BABY_OPACITY })}>
              <BabyFigure anim={anim} />
            </motion.g>

            {HEARTS.map(([x, y, start]) => (
              <g key={`${x}-${start}`} transform={`translate(${x} ${y})`}>
                <Heart anim={anim} start={start} />
              </g>
            ))}
          </motion.g>
        </svg>

        {!reduce && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute top-3 right-3 size-11 bg-background/80 backdrop-blur"
            aria-label={paused ? 'Play the animation' : 'Pause the animation'}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          </Button>
        )}
      </div>

      {/* The three beats of the story; each one fills while it is on screen. */}
      <ol aria-label="The story in three moments" className="mt-4 grid gap-3 sm:grid-cols-3">
        {CHIPS.map(({ title, text, keys }, index) => (
          <li
            key={title}
            className="relative overflow-hidden rounded-2xl border bg-card/70 px-4 pt-3 pb-4 backdrop-blur"
          >
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-5 place-items-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground',
                )}
              >
                {index + 1}
              </span>
              {title}
            </p>
            <p className="mt-1 text-xs text-pretty text-muted-foreground">{text}</p>
            <motion.span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1 bg-primary"
              style={{ originX: 0 }}
              {...anim({ scaleX: keys })}
            />
          </li>
        ))}
      </ol>
    </div>
  )
}
