'use client'

import { motion, useScroll, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'
import { CHAPTERS } from './chapters'

// A slim bar that sticks under the navbar once the hero has scrolled away. It names the chapter
// you are reading and a line along its bottom edge fills as you scroll, so the page feels like one
// story with a beginning and an end. Each chapter is also a link.
export function StoryProgress() {
  const reduce = usePrefersReducedMotion()
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  // The chapter that crosses the middle of the screen is the current one.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = CHAPTERS.findIndex((chapter) => chapter.id === entry.target.id)
            if (index !== -1) setActive(index)
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const { id } of CHAPTERS) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      aria-label="Chapters of the CareNest story"
      className="sticky top-16 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70"
    >
      <div className="page-container flex h-12 items-center gap-6">
        <p className="hidden shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase xl:block">
          The CareNest story
        </p>

        {/* Phones and tablets: just the current chapter. */}
        <p className="text-sm font-medium lg:hidden">
          <span className="text-muted-foreground">
            Chapter {active + 1} of {CHAPTERS.length}
          </span>{' '}
          · {CHAPTERS[active].label}
        </p>

        <ol className="hidden items-center gap-1 lg:flex">
          {CHAPTERS.map(({ id, label }, index) => (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={index === active ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  index === active
                    ? 'bg-secondary font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'grid size-5 place-items-center rounded-full text-[11px] font-semibold tabular-nums transition-colors',
                    index === active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {index + 1}
                </span>
                {label}
              </a>
            </li>
          ))}
        </ol>
      </div>
      <motion.span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-primary"
        style={{ scaleX: reduce ? scrollYProgress : smooth }}
      />
    </nav>
  )
}
