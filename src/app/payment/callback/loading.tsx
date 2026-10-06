import { PaymentOutcomeSkeleton } from '@/features/payment/components/payment-outcome'

// Shown while the backend confirms the payment with bKash, which can take a few seconds.
export default function PaymentCallbackLoading() {
  return <PaymentOutcomeSkeleton label="Confirming your payment with bKash" />
}
