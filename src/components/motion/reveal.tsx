'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

// Fade + rise when scrolled into view. For users who prefer reduced motion it still appears, but
// instantly. (The start position is the same for everyone: see usePrefersReducedMotion.)
export function Reveal({ children, className, delay = 0, y = 16 }: RevealProps) {
  const reduce = usePrefersReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: reduce ? 0 : 0.45, ease: 'easeOut', delay: reduce ? 0 : delay }}
    >
      {children}
    </motion.div>
  )
}
