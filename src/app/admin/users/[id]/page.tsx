import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminUser } from '@/features/admin/admin-user.server'
import { AdminStaffDetail } from '@/features/admin/components/staff-detail-page'
import { UserProfileView } from '@/features/admin/components/user-profile-view'
import { ApiError } from '@/lib/api/errors'

export const metadata: Metadata = { title: 'User profile' }

type AdminUserPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// A user that does not exist, or an id that is not even a UUID (the backend answers 400), is a 404
// page. Any other failure goes to the error boundary.
async function loadUser(id: string) {
  try {
    return await getAdminUser(id)
  } catch (error) {
    if (error instanceof ApiError && (error.isNotFound || error.status === 400)) notFound()
    throw error
  }
}

// One account, reached from the user list. A staff member has a full admin view already
// (verification, rates, hours, reviews), so it is shown here, in place, and "back" returns to the
// user list. Everyone else gets the profile built for them.
export default async function AdminUserPage({ params, searchParams }: AdminUserPageProps) {
  const [{ id }, raw] = await Promise.all([params, searchParams])
  const user = await loadUser(id)

  if (user.staffProfile) {
    return (
      <AdminStaffDetail
        staffId={user.staffProfile.id}
        page={first(raw.page)}
        backHref="/admin/users"
        backLabel="All users"
      />
    )
  }

  return <UserProfileView user={user} />
}
