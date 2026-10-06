'use client'

import { ErrorView } from '@/components/shared/error-view'

// Errors in the public pages and the login pages. The layouts above it (and the dashboards, which
// have their own error.tsx) are not covered: see global-error.tsx for the root layout.
export default function RootError(props: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorView {...props} homeHref="/" homeLabel="Back to home" fullPage />
}
