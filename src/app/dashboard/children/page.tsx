import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { childKeys } from '@/features/child/child.keys'
import { parseChildViewParams, toChildListParams } from '@/features/child/child.params'
import { getChildrenPage } from '@/features/child/child.server'
import { ChildrenView } from '@/features/child/components/children-view'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Children' }

type ChildrenPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// The list is fetched here, on the server, for the page and tier in the URL, and handed to the
// client table through the query cache, so the first paint already has the children. After that
// the client table owns it (filters, paging, optimistic delete).
export default async function ChildrenPage({ searchParams }: ChildrenPageProps) {
  const raw = await searchParams
  const params = toChildListParams(
    parseChildViewParams({ page: first(raw.page), tier: first(raw.tier), sort: first(raw.sort) }),
  )

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client table fetches (and shows its
  // own error state) instead.
  await queryClient.prefetchQuery({
    queryKey: childKeys.list(params),
    queryFn: () => getChildrenPage(params),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChildrenView />
    </HydrationBoundary>
  )
}
