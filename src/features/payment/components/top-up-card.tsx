'use client'

import { CircleAlert, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage } from '@/lib/api/errors'
import { TOP_UP_MAX_AMOUNT, TOP_UP_MIN_AMOUNT } from '@/lib/constants'
import { formatBDT } from '@/lib/format'
import { useTopUp } from '../payment.queries'
import {
  EMPTY_TOP_UP_FORM,
  type TopUpFormInput,
  topUpFormSchema,
  toTopUpPayload,
} from '../payment.schema'

// Quick picks for the amount field. They only fill the field in; the guardian can still edit it.
const QUICK_AMOUNTS = [100, 500, 1000, 2000] as const

const FIELD_NAMES = ['amount'] as const

// bKash's checkout is always on https. Anything else from the backend is refused, not followed.
function isCheckoutUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

// Adds money to the wallet through bKash: the guardian enters an amount, the backend starts a
// payment and answers with bKash's checkout page, and the browser goes there. bKash then sends the
// guardian back to /payment/callback, which asks the backend for the verified result.
export function TopUpCard() {
  const topUp = useTopUp()
  const [serverError, setServerError] = useState<string | null>(null)
  // True from the moment the checkout page is chosen until the browser has left, so the form cannot
  // be sent twice.
  const [redirecting, setRedirecting] = useState(false)

  // Coming back with the browser's Back button restores this page from memory with the form still
  // locked. Unlock it.
  useEffect(() => {
    const unlock = (event: PageTransitionEvent) => {
      if (event.persisted) setRedirecting(false)
    }
    window.addEventListener('pageshow', unlock)
    return () => window.removeEventListener('pageshow', unlock)
  }, [])

  const form = useAppForm({
    defaultValues: EMPTY_TOP_UP_FORM as TopUpFormInput,
    validators: { onChange: topUpFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      try {
        const { checkoutUrl } = await topUp.mutateAsync(toTopUpPayload(value))
        if (!isCheckoutUrl(checkoutUrl)) {
          setServerError('The payment page could not be opened. Please try again.')
          return
        }
        setRedirecting(true)
        window.location.assign(checkoutUrl)
      } catch (error) {
        // An amount the backend rejects goes under the field. Anything else (rate limit, bKash
        // unavailable, offline) is shown above the button.
        if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
          setServerError(getErrorMessage(error))
        }
      }
    },
  })

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading text-lg">Add money</CardTitle>
        <CardDescription>
          Pay with bKash, then come straight back. Between {formatBDT(TOP_UP_MIN_AMOUNT)} and{' '}
          {formatBDT(TOP_UP_MAX_AMOUNT)} each time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-col gap-4"
        >
          <form.AppField name="amount">
            {(field) => (
              <field.TextField
                label="Amount (BDT)"
                inputMode="decimal"
                autoComplete="off"
                placeholder="e.g. 500"
              />
            )}
          </form.AppField>

          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Quick amounts</legend>
            {QUICK_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                className="h-10 px-4"
                disabled={redirecting}
                onClick={() => {
                  form.setFieldValue('amount', String(amount))
                  form.setFieldMeta('amount', (meta) => ({ ...meta, isTouched: true }))
                }}
              >
                {formatBDT(amount)}
              </Button>
            ))}
          </fieldset>

          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive-soft p-3 text-sm"
            >
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              {serverError}
            </div>
          )}

          <form.AppForm>
            <form.SubmitButton disabled={redirecting}>
              {redirecting ? 'Opening bKash…' : 'Pay with bKash'}
            </form.SubmitButton>
          </form.AppForm>

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
            You pay on bKash&apos;s own page. We never see your PIN, and your balance changes only
            after bKash confirms the payment.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
