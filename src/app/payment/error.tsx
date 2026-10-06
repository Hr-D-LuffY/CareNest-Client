'use client'

import { ErrorView } from '@/components/shared/error-view'

// A payment page that could not load keeps the sidebar and offers "Try again". Retrying the callback
// page is safe: the backend never credits the same payment twice.
export default function PaymentError(props: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return <ErrorView {...props} homeHref="/dashboard/wallet" homeLabel="Back to wallet" />
}
