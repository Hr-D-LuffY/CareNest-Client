import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { TransportView } from '@/features/transport/components/transport-view'
import { transportKeys } from '@/features/transport/transport.keys'
import { getTransportPage } from '@/features/transport/transport.server'
import {
  parseTransportViewParams,
  toTransportListParams,
} from '@/features/transport/transport-list.params'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Transport' }

type TransportPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// The rides for the tab and page in the URL are fetched here, on the server, and handed to the
// client view through the query cache, so the first paint already has the rows. After that the
// client view owns it (tabs, paging, optimistic cancel).
export default async function TransportPage({ searchParams }: TransportPageProps) {
  const raw = await searchParams
  const view = parseTransportViewParams({ page: first(raw.page), tab: first(raw.tab) })
  const params = toTransportListParams(view)

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: transportKeys.list(params),
    queryFn: () => getTransportPage(params),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransportView />
    </HydrationBoundary>
  )
}
