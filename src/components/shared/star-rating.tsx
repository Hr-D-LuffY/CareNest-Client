import { Star } from 'lucide-react'
import { RATING_MAX } from '@/lib/constants'
import { cn } from '@/lib/utils'

type StarRatingProps = {
  // 0 to 5, fractions allowed (an average of 4.3 fills 4.3 stars).
  value: number
  className?: string
}

const STARS = Array.from({ length: RATING_MAX }, (_, index) => index)

// A row of stars for a score or an average. The label is spoken as one phrase; the stars
// themselves are decorative. Plain markup with no hooks.
export function StarRating({ value, className }: StarRatingProps) {
  return (
    <span
      role="img"
      aria-label={`${value.toFixed(1)} out of ${RATING_MAX} stars`}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      {STARS.map((index) => {
        const fill = Math.min(1, Math.max(0, value - index))
        return (
          <span key={index} aria-hidden="true" className="relative inline-flex">
            <Star className="size-4 text-muted-foreground/40" />
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className="size-4 max-w-none fill-warning text-warning" />
            </span>
          </span>
        )
      })}
    </span>
  )
}
