import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { RoomsView } from '@/features/room/components/rooms-view'
import { roomKeys } from '@/features/room/room.keys'
import { parseRoomViewParams, toRoomListParams } from '@/features/room/room.params'
import { getRoomsPage } from '@/features/room/room.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Care rooms' }

type RoomsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// The rooms are fetched here, on the server, for the filters, sort and page in the URL, and handed
// to the client list through the query cache, so the first paint already has the rooms. After that
// the client list owns it (filters, search, paging).
export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const raw = await searchParams
  const params = toRoomListParams(
    parseRoomViewParams({
      page: first(raw.page),
      q: first(raw.q),
      tier: first(raw.tier),
      status: first(raw.status),
      day: first(raw.day),
      date: first(raw.date),
      sort: first(raw.sort),
    }),
  )

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client list fetches (and shows its
  // own error state) instead.
  await queryClient.prefetchQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => getRoomsPage(params),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoomsView />
    </HydrationBoundary>
  )
}
