import Link from 'next/link'
import { useId } from 'react'
import { cn } from '@/lib/utils'

// The CareNest emblem: a guardian's arm and a child resting in a nest. This is the logo artwork, recoloured
// to the Caffeine theme, so its fixed colours are the one place hex values are allowed. It sits on its own light
// tile, so it reads on both the light and the dark theme.
function Emblem({ className }: { className?: string }) {
  const gradientId = useId()
  return (
    <svg viewBox="0 0 140 140" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7A5C4F" />
          <stop offset="100%" stopColor="#644A40" />
        </linearGradient>
      </defs>
      <rect width="140" height="140" rx="38" fill="#FBEFE0" />
      <circle cx="70" cy="70" r="54" stroke="#ECD3B4" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="84" cy="62" r="9" fill="#D9A877" />
      <circle cx="58" cy="50" r="13" fill="#644A40" />
      <path
        d="M 40 85 C 38 68, 52 64, 62 68 C 72 72, 78 82, 80 92 C 82 102, 94 105, 102 96 C 104 93, 105 88, 106 82"
        stroke={`url(#${gradientId})`}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 32 94 C 42 118, 98 120, 110 88 C 112 82, 111 74, 107 70"
        stroke="#3E2A22"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M 98 39 C 98 31, 106 29, 108 29 C 108 37, 102 41, 98 39 Z" fill="#D97706" />
    </svg>
  )
}

type BrandLogoProps = {
  size?: 'default' | 'lg'
  className?: string
}

// The wordmark is live text, not part of the image: it follows the theme ("Nest" turns white on
// black) and uses the site font.
export function BrandLogo({ size = 'default', className }: BrandLogoProps) {
  const large = size === 'lg'
  return (
    <Link
      href="/"
      aria-label="CareNest home"
      className={cn(
        'inline-flex items-center rounded-lg pointer-coarse:min-h-11 outline-none transition-opacity hover:opacity-85 focus-visible:ring-3 focus-visible:ring-ring/50',
        large ? 'gap-3' : 'gap-2.5',
        className,
      )}
    >
      <Emblem className={large ? 'size-14' : 'size-8 sm:size-9'} />
      <span
        className={cn(
          'font-sans font-semibold tracking-tight',
          large ? 'text-4xl' : 'text-xl sm:text-2xl',
        )}
      >
        <span className="text-brand-care">Care</span>
        <span className="text-brand-nest">Nest</span>
      </span>
    </Link>
  )
}
