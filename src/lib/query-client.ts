import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/lib/api/errors'

// One place that builds the TanStack Query client. Server state lives here and nowhere else.

// A query or mutation that handles its own errors (a form mapping `errors[]` onto its fields, a page
// showing an inline error) sets `meta: { skipGlobalError: true }`. Everything else gets the global toast.
declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: { skipGlobalError?: boolean }
    mutationMeta: { skipGlobalError?: boolean }
  }
}

// Back-navigation inside this window shows cached data without refetching.
const STALE_TIME_MS = 30_000

// How many times a failed read is repeated. A 4xx (validation, not found, forbidden) will not change
// on a retry, so only "no answer" (status 0, a sleeping backend) and 5xx are tried again.
const MAX_QUERY_RETRIES = 1

export type ApiErrorHandler = (error: unknown) => void

export function makeQueryClient(onError?: ApiErrorHandler) {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!query.meta?.skipGlobalError) onError?.(error)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!mutation.meta?.skipGlobalError) onError?.(error)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        retry: (failureCount, error) =>
          failureCount < MAX_QUERY_RETRIES &&
          (!isApiError(error) || error.isNetworkError || error.status >= 500),
        refetchOnWindowFocus: false,
      },
    },
  })
}
