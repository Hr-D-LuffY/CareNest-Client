import { cn } from '@/lib/utils'

// The assistant's face: a smiling sun. Drawn in code from theme tokens, like the landing page
// scenes, with a dark outline so the shape stays clear on any background in light and dark mode.
// Decorative: the control or heading next to it carries the accessible name.

const RAY_COUNT = 8

type SunFaceProps = {
  className?: string
  // No turning rays. For the small copies next to each reply, so many suns do not all move.
  still?: boolean
}

export function SunFace({ className, still = false }: SunFaceProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn('size-12', className)}>
      <g className={cn('origin-center [transform-box:view-box]', !still && 'animate-play-spin')}>
        {Array.from({ length: RAY_COUNT }, (_, index) => (
          <rect
            // A fixed ring of identical shapes that never reorders, so the position is the identity.
            // biome-ignore lint/suspicious/noArrayIndexKey: see above
            key={index}
            x="29"
            y="2.5"
            width="6"
            height="11"
            rx="3"
            transform={`rotate(${index * (360 / RAY_COUNT)} 32 32)`}
            strokeWidth="2"
            strokeLinejoin="round"
            className="fill-play-sun stroke-play-ink"
          />
        ))}
      </g>
      <circle cx="32" cy="32" r="16" strokeWidth="2.5" className="fill-play-sun stroke-play-ink" />
      <circle cx="23.5" cy="36" r="3.2" className="fill-play-berry" />
      <circle cx="40.5" cy="36" r="3.2" className="fill-play-berry" />
      <circle cx="26.5" cy="30" r="2" className="fill-play-ink" />
      <circle cx="37.5" cy="30" r="2" className="fill-play-ink" />
      <path
        d="M26.5 35.5 Q32 41.5 37.5 35.5"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
        className="stroke-play-ink"
      />
    </svg>
  )
}
