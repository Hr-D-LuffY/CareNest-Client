import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SunFace } from './mascots'

// The drawn top of the panel: bunting, drifting clouds, the sun and rolling hills with flowers. All
// the decoration lives here so the reading area below stays calm. Everything is aria-hidden; the
// title and description passed as children are the real content.

const FLAG_FILLS = ['fill-play-berry', 'fill-play-sun', 'fill-play-sky', 'fill-play-grass'] as const
const FLAG_COUNT = 10
const VIEW_WIDTH = 400
// The string is a quadratic curve from (0, 6) through a control point at (200, 34) to (400, 6).
const STRING_TOP = 6
const STRING_CONTROL = 34

// Where on the string flag `index` hangs, so every flag sits on the curve.
function flagAt(index: number) {
  const t = (index + 0.5) / FLAG_COUNT
  const y = STRING_TOP * (1 - t) ** 2 + 2 * STRING_CONTROL * t * (1 - t) + STRING_TOP * t ** 2
  return { x: VIEW_WIDTH * t, y }
}

function Cloud({ className }: { className?: string }) {
  return (
    <g className={className}>
      <circle cx="22" cy="30" r="16" />
      <circle cx="46" cy="20" r="21" />
      <circle cx="72" cy="31" r="15" />
      <rect x="6" y="30" width="82" height="16" rx="8" />
    </g>
  )
}

function Flower({ x, y, petal }: { x: number; y: number; petal: string }) {
  const offsets = [
    [0, -3],
    [3, 0],
    [0, 3],
    [-3, 0],
  ] as const
  return (
    <g>
      {offsets.map(([dx, dy]) => (
        <circle key={`${dx}${dy}`} cx={x + dx} cy={y + dy} r="2.6" className={petal} />
      ))}
      <circle cx={x} cy={y} r="2" className="fill-play-sun stroke-play-ink" strokeWidth="0.8" />
    </g>
  )
}

export function AssistantBanner({ children }: { children: ReactNode }) {
  return (
    // A coral-to-peach sunset sky. The `dark:` stops keep it dark enough for light text at night.
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-b-[2rem] bg-linear-to-b from-play-berry/70 via-play-sun/40 to-play-berry-soft',
        'dark:from-play-berry/25 dark:via-play-sun/15',
      )}
    >
      <svg
        viewBox="0 0 400 160"
        aria-hidden="true"
        preserveAspectRatio="xMidYMin slice"
        className="pointer-events-none absolute inset-0 size-full"
      >
        <g className="animate-play-drift">
          <Cloud className="translate-x-4 translate-y-14 fill-card opacity-80" />
        </g>
        <g className="animate-play-drift [animation-delay:-5s]">
          <g transform="translate(250 96) scale(0.6)">
            <Cloud className="fill-card opacity-80" />
          </g>
        </g>
        <path
          d={`M0 ${STRING_TOP} Q200 ${STRING_CONTROL} 400 ${STRING_TOP}`}
          fill="none"
          strokeWidth="1.5"
          className="stroke-play-ink"
        />
        {Array.from({ length: FLAG_COUNT }, (_, index) => {
          const { x, y } = flagAt(index)
          return (
            <path
              key={FLAG_FILLS[index % FLAG_FILLS.length] + x}
              d={`M${x - 10} ${y - 1} L${x + 10} ${y - 1} L${x} ${y + 17} Z`}
              strokeWidth="1.5"
              strokeLinejoin="round"
              className={cn('stroke-play-ink', FLAG_FILLS[index % FLAG_FILLS.length])}
            />
          )
        })}
      </svg>

      <SunFace className="animate-play-bob pointer-events-none absolute top-9 right-18 size-20 drop-shadow-sm" />

      <svg
        viewBox="0 0 400 48"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-auto w-full"
      >
        <path d="M0 30 Q70 6 150 22 T300 16 T400 24 V48 H0 Z" className="fill-play-berry/70" />
        <path d="M0 38 Q90 18 200 34 T400 30 V48 H0 Z" className="fill-play-sun" />
        <Flower x={58} y={34} petal="fill-play-berry" />
        <Flower x={148} y={37} petal="fill-card" />
        <Flower x={262} y={33} petal="fill-play-sky" />
        <Flower x={342} y={31} petal="fill-play-berry" />
      </svg>

      <div className="relative">{children}</div>
    </div>
  )
}
