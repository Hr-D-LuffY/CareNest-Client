import { ApiError } from '@/lib/api/errors'

// A section of a page that loaded, or one that failed. A failed section shows an inline message
// while the rest of the page still renders.
export type Loaded<T> = { ok: true; data: T } | { ok: false }

// Turns one settled request into a Loaded section. No session is not a section problem: it is
// rethrown so the error boundary handles it instead of showing a dozen "could not load" cards.
export function settle<T>(result: PromiseSettledResult<T>): Loaded<T> {
  if (result.status === 'fulfilled') return { ok: true, data: result.value }
  if (result.reason instanceof ApiError && result.reason.isUnauthorized) throw result.reason
  return { ok: false }
}

export function mapLoaded<T, R>(loaded: Loaded<T>, convert: (data: T) => R): Loaded<R> {
  return loaded.ok ? { ok: true, data: convert(loaded.data) } : { ok: false }
}
