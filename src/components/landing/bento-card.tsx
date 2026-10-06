import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BentoCardProps = {
  children: ReactNode
  // A featured tile gets a soft tint so the eye lands on it first.
  featured?: boolean
  className?: string
}

// One tile of a landing-page bento grid. Grid placement (col-span, row-span) is passed in by the
// caller, so every section shares the same surface, radius and hover.
export function BentoCard({ children, featured = false, className }: BentoCardProps) {
  return (
    <div
      className={cn(
        'relative h-full overflow-hidden rounded-3xl border p-6 shadow-soft transition-shadow hover:shadow-card sm:p-7',
        featured ? 'bg-linear-to-br from-info-soft via-card to-card' : 'bg-card',
        className,
      )}
    >
      {children}
    </div>
  )
}
