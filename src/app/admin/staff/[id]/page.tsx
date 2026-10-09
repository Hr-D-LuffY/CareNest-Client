import type { Metadata } from 'next'
import { AdminStaffDetail } from '@/features/admin/components/staff-detail-page'

export const metadata: Metadata = { title: 'Staff member' }

type AdminStaffDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// One staff member, reached from the staff list.
export default async function AdminStaffDetailPage({
  params,
  searchParams,
}: AdminStaffDetailPageProps) {
  const [{ id }, raw] = await Promise.all([params, searchParams])

  return (
    <AdminStaffDetail
      staffId={id}
      page={first(raw.page)}
      backHref="/admin/staff"
      backLabel="All staff"
    />
  )
}
