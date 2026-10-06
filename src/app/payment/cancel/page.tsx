import { CircleX, TriangleAlert, Wallet } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { OutcomeView } from '@/components/shared/outcome-view'
import { buttonVariants } from '@/components/ui/button'
import { parseCancelReason } from '@/features/payment/payment.outcome'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Payment not completed' }

type CancelPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// Where a top-up that did not go through lands: the guardian backed out on bKash, or bKash could not
// complete it. Either way the backend adds nothing to the wallet. No data to load, so no skeleton.
export default async function PaymentCancelPage({ searchParams }: CancelPageProps) {
  const reason = parseCancelReason(first((await searchParams).reason))
  const failed = reason === 'failed'

  return (
    <OutcomeView
      icon={failed ? TriangleAlert : CircleX}
      tone={failed ? 'danger' : 'warning'}
      title={failed ? 'The payment did not go through' : 'Payment cancelled'}
      description={
        failed
          ? 'bKash could not complete this payment. Nothing was added to your wallet. If bKash took money from you anyway, contact us with the time of the payment.'
          : 'You left bKash before paying, so nothing was added to your wallet. You can try again whenever you are ready.'
      }
    >
      <Link
        href="/dashboard/wallet"
        className={cn(buttonVariants(), 'h-11 px-5 text-sm font-semibold')}
      >
        <Wallet aria-hidden="true" />
        Try again
      </Link>
      <Link
        href={failed ? '/contact' : '/dashboard'}
        className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-5 text-sm')}
      >
        {failed ? 'Contact us' : 'Back to dashboard'}
      </Link>
    </OutcomeView>
  )
}
