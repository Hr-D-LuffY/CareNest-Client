import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { adminStaffKeys } from '@/features/admin/admin-staff.keys'
import { getAdminStaff } from '@/features/admin/admin-staff.server'
import { StaffDetailView } from '@/features/admin/components/staff-detail-view'
import { staffKeys } from '@/features/staff/staff.keys'
import { REVIEWS_PAGE_SIZE } from '@/features/staff/staff.params'
import { getStaffAvailability, getStaffRatings } from '@/features/staff/staff.server'
import { ApiError } from '@/lib/api/errors'
import { DEFAULT_PAGE } from '@/lib/constants'
import { makeQueryClient } from '@/lib/query-client'
import { StaffType } from '@/types'

export const metadata: Metadata = { title: 'Staff member' }

type AdminStaffDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// A staff member that does not exist, or an id that is not even a UUID (the backend answers 400),
// is a 404 page. Any other failure goes to the error boundary.
async function loadStaff(id: string) {
  try {
    return await getAdminStaff(id)
  } catch (error) {
    if (error instanceof ApiError && (error.isNotFound || error.status === 400)) notFound()
    throw error
  }
}

// The hours and reviews are not essential: if one fails the profile still shows, and the client
// section fetches it again and shows its own error with a retry. A signed-out session is still an
// error, so the usual redirect can run.
async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) throw error
    return null
  }
}

// One staff member. The profile, their weekly hours (sitters only) and the first page of reviews
// (?page=) are fetched here on the server and handed to the client view through the query cache.
export default async function AdminStaffDetailPage({
  params,
  searchParams,
}: AdminStaffDetailPageProps) {
  const [{ id }, raw] = await Promise.all([params, searchParams])
  const staff = await loadStaff(id)

  const pageNumber = Number(first(raw.page))
  const ratingsParams = {
    page: Number.isInteger(pageNumber) && pageNumber >= DEFAULT_PAGE ? pageNumber : DEFAULT_PAGE,
    limit: REVIEWS_PAGE_SIZE,
  }

  const [ratings, availability] = await Promise.all([
    orNull(getStaffRatings(staff.id, ratingsParams)),
    staff.staffType === StaffType.DRIVER ? null : orNull(getStaffAvailability(staff.id)),
  ])

  const queryClient = makeQueryClient()
  queryClient.setQueryData(adminStaffKeys.detail(id), staff)
  if (ratings) queryClient.setQueryData(staffKeys.ratings(staff.id, ratingsParams), ratings)
  if (availability) queryClient.setQueryData(staffKeys.availability(staff.id), availability)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StaffDetailView id={id} />
    </HydrationBoundary>
  )
}
