import { OutcomeSkeleton } from '@/components/shared/outcome-view'

// Shown while the backend confirms the payment with bKash, which can take a few seconds.
export default function PaymentCallbackLoading() {
  return <OutcomeSkeleton label="Confirming your payment with bKash" />
}
