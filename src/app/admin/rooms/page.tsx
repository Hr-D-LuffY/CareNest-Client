import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { ADMIN_ROOMS_PAGE_SIZE } from '@/features/admin/admin-room.params'
import { RoomsListView } from '@/features/admin/components/rooms-list-view'
import { roomKeys } from '@/features/room/room.keys'
import { parseRoomViewParams, toRoomListParams } from '@/features/room/room.params'
import { getRoomsPage } from '@/features/room/room.server'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Care rooms' }

type AdminRoomsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// The admin's room list. The rooms for the filters, sort and page in the URL are fetched here, on the
// server, and handed to the client view through the query cache, so the first paint already has
// them.
export default async function AdminRoomsPage({ searchParams }: AdminRoomsPageProps) {
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
    ADMIN_ROOMS_PAGE_SIZE,
  )

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => getRoomsPage(params),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RoomsListView />
    </HydrationBoundary>
  )
}
