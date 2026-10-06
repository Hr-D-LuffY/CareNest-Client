'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

type StaggerProps = {
  children: ReactNode
  className?: string
  gap?: number
}

// Reveals its StaggerItem children one after another when scrolled into view. With reduced motion
// they all appear at once.
export function Stagger({ children, className, gap = 0.08 }: StaggerProps) {
  const reduce = usePrefersReducedMotion()

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-48px' }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : gap } } }}
    >
      {children}
    </motion.div>
  )
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
  y?: number
}

export function StaggerItem({ children, className, y = 16 }: StaggerItemProps) {
  const reduce = usePrefersReducedMotion()

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.4, ease: 'easeOut' } },
      }}
    >
      {children}
    </motion.div>
  )
}
