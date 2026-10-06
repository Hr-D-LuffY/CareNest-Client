'use client'

import { DoorOpen, House } from 'lucide-react'
import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

// A ride from home to the care room: the route draws itself once, then a vehicle keeps driving along
// it. A concept drawing (no addresses, no times). The moving dot is left out for reduced motion.
const ROUTE = 'M 56 214 C 150 214, 110 96, 224 112 S 340 196, 424 70'

export function RouteScene() {
  const reduce = usePrefersReducedMotion()

  return (
    <div
      role="img"
      aria-label="Illustration: a supervised ride travels from home to the care room."
      className="relative aspect-[12/7] w-full overflow-hidden rounded-3xl border bg-card shadow-float"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[40px_40px] opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
      />
      <svg
        viewBox="0 0 480 280"
        fill="none"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <path
          d={ROUTE}
          className="stroke-border"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="2 12"
        />
        <motion.path
          d={ROUTE}
          className="stroke-info"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '-48px' }}
          transition={{ duration: reduce ? 0 : 1.6, ease: 'easeInOut' }}
        />
        {!reduce && (
          <circle r="9" className="fill-brand-care stroke-card" strokeWidth="3">
            <animateMotion
              dur="7s"
              repeatCount="indefinite"
              path={ROUTE}
              calcMode="spline"
              keyTimes="0;1"
              keySplines="0.4 0 0.2 1"
            />
          </circle>
        )}
      </svg>

      <div className="absolute bottom-[8%] left-[4%] flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-medium shadow-card">
        <House aria-hidden="true" className="size-4 text-info" />
        Home
      </div>
      <div className="absolute top-[6%] right-[3%] flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-medium shadow-card">
        <DoorOpen aria-hidden="true" className="size-4 text-success" />
        Care room
      </div>
    </div>
  )
}
