import { PaymentStatus } from '@/types'

// Why a top-up did not go through. The cancel page words each one differently.
export const CANCEL_REASONS = ['cancelled', 'failed'] as const
export type CancelReason = (typeof CANCEL_REASONS)[number]

export function parseCancelReason(value: string | undefined): CancelReason | undefined {
  return CANCEL_REASONS.find((reason) => reason === value)
}

// Where the guardian goes once the backend has settled the payment with bKash. Only the backend's
// verified status counts, never the `status` bKash put in the URL.
//   SUCCESS   → the success page
//   PENDING   → the success page too: it says the payment is still being confirmed
//   CANCELLED → the cancel page
//   FAILED    → the cancel page
export function destinationFor(paymentId: string, status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.SUCCESS:
    case PaymentStatus.PENDING:
      return `/payment/success?paymentId=${encodeURIComponent(paymentId)}`
    case PaymentStatus.CANCELLED:
      return '/payment/cancel?reason=cancelled'
    case PaymentStatus.FAILED:
      return '/payment/cancel?reason=failed'
  }
}
