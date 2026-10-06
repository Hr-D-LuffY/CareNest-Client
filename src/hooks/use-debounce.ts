'use client'

import { useEffect, useState } from 'react'
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants'

// The value, but only after it has stopped changing for `delay` ms. Used for search boxes: the
// input follows every keystroke, the URL (and so the request) follows this.
export function useDebounce<T>(value: T, delay: number = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
