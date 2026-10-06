import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { destinationFor } from '@/features/payment/payment.outcome'
import { confirmBkashCallback } from '@/features/payment/payment.server'
import { isApiError } from '@/lib/api/errors'
import type { BkashCallbackStatus } from '@/types'

export const metadata: Metadata = { title: 'Confirming payment' }

type CallbackPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

const CALLBACK_STATUSES: readonly BkashCallbackStatus[] = ['success', 'failure', 'cancel']

// The backend answers 402 for a payment bKash reported as failed. That is an outcome, not a crash.
const PAYMENT_FAILED = 402

// Asks the backend what really happened and returns the page to show next.
async function resolveDestination(paymentID: string, status: BkashCallbackStatus) {
  try {
    const result = await confirmBkashCallback(paymentID, status)
    return destinationFor(result.id, result.status)
  } catch (error) {
    if (isApiError(error)) {
      if (error.status === PAYMENT_FAILED) return '/payment/cancel?reason=failed'
      // Missing or malformed ids and unknown payments: not a page worth showing.
      if (error.status === 400 || error.status === 404) notFound()
    }
    // Offline, a sleeping backend or a rate limit: the error page offers "Try again". Running this
    // page again is safe, because the backend never credits the same payment twice.
    throw error
  }
}

// bKash sends the guardian's browser here after checkout, with ?paymentID=&status=. The status in the
// URL is only a hint: this page asks the backend, which re-checks the payment with bKash itself, and
// goes by what the backend answers. The loading.tsx skeleton shows while it works.
export default async function PaymentCallbackPage({ searchParams }: CallbackPageProps) {
  const raw = await searchParams
  const paymentID = first(raw.paymentID)
  const status = CALLBACK_STATUSES.find((option) => option === first(raw.status))
  if (!paymentID || !status) notFound()

  redirect(await resolveDestination(paymentID, status))
}
