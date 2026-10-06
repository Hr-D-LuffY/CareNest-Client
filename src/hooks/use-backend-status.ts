'use client'

import { useSyncExternalStore } from 'react'

// Whether the (sleeping) backend has been woken up, shared by every "Activate Backend" button and
// kept across page changes and reloads. Render's free tier goes back to sleep after about 15 minutes
// without traffic, so "activated" lasts a little less than that and then the button is offered again.

export type BackendStatus = 'idle' | 'pending' | 'activated'

const STORAGE_KEY = 'carenest.backend-awake-at'
const AWAKE_WINDOW_MS = 12 * 60_000

let pending = false
let memoryAwakeAt: number | null = null
let expiryTimer: number | undefined
const listeners = new Set<() => void>()

function readAwakeAt(): number | null {
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY))
    if (Number.isFinite(stored) && stored > 0) return stored
  } catch {
    // Private mode or blocked storage: fall back to this tab's memory.
  }
  return memoryAwakeAt
}

function writeAwakeAt(value: number | null) {
  memoryAwakeAt = value
  try {
    if (value === null) window.localStorage.removeItem(STORAGE_KEY)
    else window.localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // The in-memory copy above still works for this tab.
  }
}

function getSnapshot(): BackendStatus {
  if (pending) return 'pending'
  const awakeAt = readAwakeAt()
  return awakeAt !== null && Date.now() - awakeAt < AWAKE_WINDOW_MS ? 'activated' : 'idle'
}

function emit() {
  for (const listener of listeners) listener()
}

// Re-render the buttons the moment "activated" runs out.
function scheduleExpiry() {
  window.clearTimeout(expiryTimer)
  const awakeAt = readAwakeAt()
  if (awakeAt === null) return
  const remaining = awakeAt + AWAKE_WINDOW_MS - Date.now()
  if (remaining > 0) expiryTimer = window.setTimeout(emit, remaining + 50)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', emit)
  scheduleExpiry()
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', emit)
    if (listeners.size === 0) window.clearTimeout(expiryTimer)
  }
}

export function markBackendPending() {
  pending = true
  emit()
}

export function markBackendAwake() {
  pending = false
  writeAwakeAt(Date.now())
  scheduleExpiry()
  emit()
}

export function markBackendFailed() {
  pending = false
  emit()
}

// The server render and first client render both say "idle", so there is no hydration mismatch.
export function useBackendStatus(): BackendStatus {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'idle')
}
