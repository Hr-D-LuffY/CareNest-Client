import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { adminStaffKeys } from '@/features/admin/admin-staff.keys'
import {
  parseAdminStaffViewParams,
  toAdminStaffListParams,
} from '@/features/admin/admin-staff.params'
import { getAdminStaffPage } from '@/features/admin/admin-staff.server'
import { StaffListView } from '@/features/admin/components/staff-list-view'
import { makeQueryClient } from '@/lib/query-client'

export const metadata: Metadata = { title: 'Staff' }

type AdminStaffPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// The staff list. The page in the URL (?q=&type=&status=&page=) is fetched here, on the server, and
// handed to the client view through the query cache, so the first paint already has the staff.
export default async function AdminStaffPage({ searchParams }: AdminStaffPageProps) {
  const raw = await searchParams
  const params = toAdminStaffListParams(
    parseAdminStaffViewParams({
      page: first(raw.page),
      q: first(raw.q),
      type: first(raw.type),
      status: first(raw.status),
    }),
  )

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: adminStaffKeys.list(params),
    queryFn: () => getAdminStaffPage(params),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StaffListView />
    </HydrationBoundary>
  )
}
