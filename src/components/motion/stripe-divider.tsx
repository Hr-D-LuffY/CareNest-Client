'use client'

import { motion, useReducedMotion } from 'motion/react'

// How far the stripes drift. A multiple of the 10px pattern tile, so the ends look identical.
const DRIFT_PX = 1000

// Decorative diagonal stripes that slowly slide sideways once, when scrolled into view. Moved with
// transform (not background-position), so it runs on the GPU. Static for reduced motion.
export function StripeDivider() {
  const reduce = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      className="relative h-12 w-full overflow-hidden border-y border-foreground/10"
    >
      <motion.div
        className="absolute inset-y-0 -left-[1000px] w-[calc(100%+1000px)] bg-[repeating-linear-gradient(315deg,currentColor_0,currentColor_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] text-foreground/10"
        initial={{ x: 0 }}
        whileInView={reduce ? undefined : { x: DRIFT_PX }}
        viewport={{ once: true }}
        transition={{ duration: 20, ease: 'linear' }}
      />
    </div>
  )
}
