'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

// Fade + rise when scrolled into view. Skips the movement when the user prefers reduced motion.
export function Reveal({ children, className, delay = 0, y = 16 }: RevealProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.45, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
