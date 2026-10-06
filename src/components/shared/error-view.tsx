'use client'

import { House, RotateCw, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ErrorScreen } from './error-screen'

type ErrorViewProps = {
  error: Error & { digest?: string }
  retry: () => void
  homeHref: string
  homeLabel: string
  fullPage?: boolean
}

// The body of every error.tsx (root, dashboard, staff, admin). The page is not blank and not a raw
// stack trace: a clear message, "Try again" (re-fetches the segment) and a way out. In production
// Next hides the real message from the browser, so only its digest is shown, for support.
export function ErrorView({ error, retry, homeHref, homeLabel, fullPage }: ErrorViewProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorScreen
      icon={TriangleAlert}
      title="Something went wrong"
      description="We could not load this page. This is usually temporary, so try again in a moment. If the backend was asleep, it can take up to a minute to wake."
      reference={error.digest}
      fullPage={fullPage}
    >
      <Button type="button" onClick={() => retry()} className="h-11 px-5 text-sm font-semibold">
        <RotateCw aria-hidden="true" />
        Try again
      </Button>
      <Link
        href={homeHref}
        className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-5 text-sm')}
      >
        <House aria-hidden="true" />
        {homeLabel}
      </Link>
    </ErrorScreen>
  )
}
