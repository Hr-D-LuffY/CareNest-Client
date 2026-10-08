import type { Metadata } from 'next'
import { StaffWizard } from '@/features/admin/components/staff-wizard'

export const metadata: Metadata = { title: 'Add staff' }

// The create-staff wizard. It needs nothing from the backend until the final submit, so there is
// nothing to prefetch.
export default function AddStaffPage() {
  return <StaffWizard />
}
