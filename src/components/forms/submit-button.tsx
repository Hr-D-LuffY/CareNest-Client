'use client'

import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { useFormContext } from './form-context'

type SubmitButtonProps = {
  children: ReactNode
  // Extra reason to stay disabled, e.g. a login that succeeded and is now navigating away.
  disabled?: boolean
}

// Full-width submit. Disabled and showing a spinner while the form submits, so it cannot be sent twice.
export function SubmitButton({ children, disabled = false }: SubmitButtonProps) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          type="submit"
          disabled={isSubmitting || disabled}
          className="h-12 w-full rounded-xl text-base font-semibold"
        >
          {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
          {children}
        </Button>
      )}
    </form.Subscribe>
  )
}
