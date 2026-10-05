'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { type ReactNode, useState } from 'react'
import { makeQueryClient } from '@/lib/query-client'
import { handleApiError } from '@/lib/query-error-handler'

// useState keeps one client per browser tab, so the cache survives re-renders and navigation.
// The devtools render nothing in a production build.
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient(handleApiError))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
