'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DEFAULT_PAGE } from '@/lib/constants'

// A value of undefined, null or '' removes the param from the URL.
export type QueryParamUpdates = Record<string, string | number | null | undefined>

// The URL is the single source of truth for a list's filters, search, sort and page (so a refresh,
// the back button or a shared link all show the same list). Read with `get` / `getPage`, write
// with `set` / `setPage`. The component using it must sit under a <Suspense> boundary (Next
// requirement for useSearchParams on prerendered routes); the page's loading.tsx covers that.
export function useQueryParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // `push` adds a history entry (a wizard step the Back button should return to); the default
  // replaces the current one, so a filter change does not fill the history.
  function replace(next: URLSearchParams, push = false) {
    const query = next.toString()
    const url = query ? `${pathname}?${query}` : pathname
    // scroll: false keeps the reader where they are when a filter changes.
    if (push) router.push(url, { scroll: false })
    else router.replace(url, { scroll: false })
  }

  // The raw string, or undefined when the param is absent or empty.
  function get(key: string): string | undefined {
    return searchParams.get(key) || undefined
  }

  // The value only if it is one of `allowed`, so a hand-edited URL (?tier=NOPE) falls back to "no
  // filter" instead of reaching the backend as a 400.
  function getOneOf<T extends string>(key: string, allowed: readonly T[]): T | undefined {
    const value = searchParams.get(key)
    return allowed.find((option) => option === value)
  }

  // A positive whole number, else the default (?page=abc, ?page=0 and ?page=-2 all mean page 1).
  function getPage(): number {
    const page = Number(searchParams.get('page'))
    return Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE
  }

  // Changes filters, search or sort. The page goes back to 1 unless `updates` sets it, because the
  // old page number rarely exists in the new result set.
  function set(updates: QueryParamUpdates, options: { push?: boolean } = {}) {
    const next = new URLSearchParams(searchParams.toString())
    if (!('page' in updates)) next.delete('page')

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === null || value === '') next.delete(key)
      else next.set(key, String(value))
    }
    replace(next, options.push)
  }

  // Changes only the page. Page 1 is the default, so it is left out of the URL.
  function setPage(page: number) {
    const next = new URLSearchParams(searchParams.toString())
    if (page <= DEFAULT_PAGE) next.delete('page')
    else next.set('page', String(page))
    replace(next)
  }

  // Removes the given params (or every param when none are named) and so the page too.
  function clear(...keys: string[]) {
    const next = new URLSearchParams(searchParams.toString())
    if (keys.length === 0) {
      for (const key of [...next.keys()]) next.delete(key)
    } else {
      for (const key of keys) next.delete(key)
      next.delete('page')
    }
    replace(next)
  }

  return { searchParams, get, getOneOf, getPage, set, setPage, clear }
}
