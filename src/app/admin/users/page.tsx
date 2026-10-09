import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { adminUserKeys } from '@/features/admin/admin-user.keys'
import { parseAdminUserViewParams, toAdminUserListParams } from '@/features/admin/admin-user.params'
import { getAdminUsersPage } from '@/features/admin/admin-user.server'
import { UsersListView } from '@/features/admin/components/users-list-view'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Users' }

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// The user list. The page in the URL (?role=&page=) is fetched here, on the server, and handed to the
// client view through the query cache, so the first paint already has the users.
export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const raw = await searchParams
  const params = toAdminUserListParams(
    parseAdminUserViewParams({ page: first(raw.page), role: first(raw.role) }),
  )

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: adminUserKeys.list(params),
    queryFn: () => getAdminUsersPage(params),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersListView />
    </HydrationBoundary>
  )
}
