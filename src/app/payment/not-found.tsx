import { NotFoundView } from '@/components/shared/not-found-view'

// A payment link with a missing or unknown payment id, or a payment that is not yours.
export default function PaymentNotFound() {
  return (
    <NotFoundView
      homeHref="/dashboard/wallet"
      homeLabel="Back to wallet"
      description="We could not find that payment. It may not exist, or it may belong to someone else."
    />
  )
}
