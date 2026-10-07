'use client'

import { useEffect, useState } from 'react'

// The current time in ms, refreshed every `intervalMs`, for live labels like "In care · 1h 20m".
// It is null on the server and on the first client render, so the server HTML and hydration agree;
// callers show a time-free label until it has a value.
export function useNow(intervalMs = 30_000): number | null {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}
