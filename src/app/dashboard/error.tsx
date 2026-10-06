'use client'

import { ErrorView } from '@/components/shared/error-view'

// Errors inside the guardian area keep the sidebar and top bar, so the user can navigate away.
export default function GuardianError(props: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorView {...props} homeHref="/dashboard" homeLabel="Back to dashboard" />
}
