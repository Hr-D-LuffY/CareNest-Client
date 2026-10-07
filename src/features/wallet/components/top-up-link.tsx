import { Wallet } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// The way out of a "your wallet is too low" message (a booking or a ride refused with 402).
// Plain markup with no hooks.
export function TopUpLink({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard/wallet"
      className={cn(buttonVariants({ variant: 'outline' }), 'h-10 w-fit px-4', className)}
    >
      <Wallet aria-hidden="true" />
      Top up wallet
    </Link>
  )
}
