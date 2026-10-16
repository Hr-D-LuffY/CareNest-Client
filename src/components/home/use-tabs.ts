'use client'

import { type KeyboardEvent, useRef, useState } from 'react'

// Keyboard behaviour for a row of tabs (the WAI-ARIA tabs pattern): arrow keys move between tabs,
// Home and End jump to the ends, and only the selected tab is in the Tab order.
export function useTabs(count: number, initial = 0) {
  const [index, setIndex] = useState(initial)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function select(next: number) {
    const wrapped = (next + count) % count
    setIndex(wrapped)
    tabRefs.current[wrapped]?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const keys: Record<string, number | undefined> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: count - 1,
    }
    const next = keys[event.key]
    if (next === undefined) return
    event.preventDefault()
    select(next)
  }

  return {
    index,
    setIndex,
    onKeyDown,
    setTabRef: (position: number) => (element: HTMLButtonElement | null) => {
      tabRefs.current[position] = element
    },
  }
}
