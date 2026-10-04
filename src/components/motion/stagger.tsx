'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

type StaggerProps = {
  children: ReactNode
  className?: string
  gap?: number
}

// Reveals its StaggerItem children one after another when scrolled into view.
export function Stagger({ children, className, gap = 0.08 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-48px' }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: gap } } }}
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
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
      }}
    >
      {children}
    </motion.div>
  )
}
