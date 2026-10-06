'use client'

import { Baby, Bus, CalendarCheck, type LucideIcon, ShieldCheck, Star, Wallet } from 'lucide-react'
import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'

// Hero right side: the platform as an orbit. A child sits at the centre and the things
// that look after them (verified staff, rides, bookings, the wallet, ratings) circle slowly around.
// Each satellite counter-rotates so its icon always stays upright. A concept drawing, no data.

const LOOP = Number.POSITIVE_INFINITY
const ORBIT_SECONDS = 48
const RADIUS_PERCENT = 41

const SATELLITES: readonly { icon: LucideIcon; label: string; tone: string }[] = [
  { icon: ShieldCheck, label: 'Verified staff', tone: 'bg-info-soft text-info' },
  { icon: Bus, label: 'Supervised rides', tone: 'bg-warning-soft text-warning' },
  { icon: CalendarCheck, label: 'Bookings', tone: 'bg-success-soft text-success' },
  { icon: Wallet, label: 'One wallet', tone: 'bg-secondary text-secondary-foreground' },
  { icon: Star, label: 'Ratings', tone: 'bg-info-soft text-info' },
]

export function HeroOrbit() {
  const reduce = usePrefersReducedMotion()

  return (
    <div
      role="img"
      aria-label="Illustration: a child at the centre with verified staff, rides, bookings, the wallet and ratings orbiting around them."
      className="relative aspect-square w-full max-w-md"
    >
      {/* Rings */}
      <div
        aria-hidden="true"
        className="absolute inset-[9%] rounded-full border-2 border-dashed border-border"
      />
      <div
        aria-hidden="true"
        className="absolute inset-[28%] rounded-full border border-border bg-info-soft/60"
      />

      {/* A pulse leaving the centre */}
      {!reduce && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-[38%] rounded-full border-2 border-primary/40"
          animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
          transition={{ duration: 3.2, ease: 'easeOut', repeat: LOOP }}
        />
      )}

      {/* Centre */}
      <div className="absolute inset-[38%] grid place-items-center rounded-full bg-primary text-primary-foreground shadow-float">
        <Baby aria-hidden="true" className="size-1/2" />
      </div>

      {/* Satellites */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        animate={reduce ? { rotate: 0 } : { rotate: 360 }}
        transition={{ duration: ORBIT_SECONDS, ease: 'linear', repeat: LOOP }}
      >
        {SATELLITES.map(({ icon: Icon, label, tone }, index) => {
          const angle = (index / SATELLITES.length) * 2 * Math.PI
          const left = 50 + RADIUS_PERCENT * Math.sin(angle)
          const top = 50 - RADIUS_PERCENT * Math.cos(angle)
          return (
            <div
              key={label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${Number(left.toFixed(2))}%`, top: `${Number(top.toFixed(2))}%` }}
            >
              <motion.div
                animate={reduce ? { rotate: 0 } : { rotate: -360 }}
                transition={{ duration: ORBIT_SECONDS, ease: 'linear', repeat: LOOP }}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className={cn(
                    'grid size-12 place-items-center rounded-2xl border bg-card shadow-card sm:size-14',
                    tone,
                  )}
                >
                  <Icon className="size-5 sm:size-6" />
                </span>
                <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-foreground shadow-soft">
                  {label}
                </span>
              </motion.div>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
