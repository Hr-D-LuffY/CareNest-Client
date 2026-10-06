'use client'

import { ErrorView } from '@/components/shared/error-view'

// Errors inside the admin area keep the sidebar and top bar, so the user can navigate away.
export default function AdminError(props: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorView {...props} homeHref="/admin" homeLabel="Back to admin" />
}
