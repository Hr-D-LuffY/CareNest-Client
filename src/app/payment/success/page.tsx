import { CircleCheck, Clock, RotateCw, Wallet } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { OutcomeView } from '@/components/shared/outcome-view'
import { buttonVariants } from '@/components/ui/button'
import { getGuardianProfile } from '@/features/guardian/guardian.server'
import { RefreshWalletData } from '@/features/payment/components/refresh-wallet-data'
import { destinationFor } from '@/features/payment/payment.outcome'
import { getPayment } from '@/features/payment/payment.server'
import { isApiError } from '@/lib/api/errors'
import { formatActivityTime, formatBDT } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type Payment, PaymentStatus } from '@/types'

export const metadata: Metadata = { title: 'Payment status' }

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

async function loadPayment(id: string): Promise<Payment> {
  try {
    return await getPayment(id)
  } catch (error) {
    // An id that does not exist, is not a valid id, or belongs to another guardian.
    if (isApiError(error) && (error.status === 400 || error.status === 404)) notFound()
    throw error
  }
}

// Where a verified top-up lands. Everything shown here is read from the backend's own record of
// the payment, never from the URL, so opening this page with a made-up id shows nothing.
export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const paymentId = first((await searchParams).paymentId)
  if (!paymentId) notFound()

  const payment = await loadPayment(paymentId)

  // A payment that did not succeed does not belong on this page.
  const destination = destinationFor(payment.id, payment.status)
  if (!destination.startsWith('/payment/success')) redirect(destination)

  if (payment.status === PaymentStatus.PENDING) {
    return (
      <OutcomeView
        icon={Clock}
        tone="warning"
        title="Still confirming your payment"
        description="bKash has not confirmed this payment yet. Your balance changes as soon as it does, and nothing is taken twice. Check again in a moment."
        details={[{ label: 'Amount', value: formatBDT(payment.amount) }]}
      >
        <Link
          href={`/payment/success?paymentId=${encodeURIComponent(payment.id)}`}
          className={cn(buttonVariants(), 'h-11 px-5 text-sm font-semibold')}
        >
          <RotateCw aria-hidden="true" />
          Check again
        </Link>
        <Link
          href="/dashboard/wallet"
          className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-5 text-sm')}
        >
          <Wallet aria-hidden="true" />
          Go to wallet
        </Link>
      </OutcomeView>
    )
  }

  // The balance is a nice extra. If it cannot be loaded the payment is still shown.
  const profile = await getGuardianProfile().catch(() => null)

  return (
    <>
      <RefreshWalletData />
      <OutcomeView
        icon={CircleCheck}
        tone="success"
        title="Wallet topped up"
        description="bKash confirmed your payment and the money is in your wallet."
        details={[
          { label: 'Amount added', value: formatBDT(payment.amount) },
          ...(profile
            ? [{ label: 'New balance', value: formatBDT(profile.guardianProfile.walletBalance) }]
            : []),
          ...(payment.gatewayTrxId
            ? [{ label: 'bKash transaction ID', value: payment.gatewayTrxId }]
            : []),
          { label: 'Paid', value: formatActivityTime(payment.updatedAt) },
        ]}
      >
        <Link
          href="/dashboard/wallet"
          className={cn(buttonVariants(), 'h-11 px-5 text-sm font-semibold')}
        >
          <Wallet aria-hidden="true" />
          View wallet
        </Link>
        <Link
          href="/dashboard/rooms"
          className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-5 text-sm')}
        >
          Browse care rooms
        </Link>
      </OutcomeView>
    </>
  )
}
