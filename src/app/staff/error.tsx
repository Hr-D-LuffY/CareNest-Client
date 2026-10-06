'use client'

import { ErrorView } from '@/components/shared/error-view'

// Errors inside the staff area keep the sidebar and top bar, so the user can navigate away.
export default function StaffError(props: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorView {...props} homeHref="/staff" homeLabel="Back to my tasks" />
}
