'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

// True when the user asked the system for less motion.
//
// Unlike motion's own useReducedMotion(), the server and the first client render agree (both say
// false), so server HTML and hydration never differ. React switches to the real value right after
// hydration. So never use it to choose an *initial* style: pick the animation's duration or whether
// to start it, which are read later, when it runs.
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
