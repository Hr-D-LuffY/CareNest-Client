'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDeleteAccount } from '../guardian.queries'

// Closing the account. It is separate from the profile form and goes through a confirm dialog, since
// it cannot be undone from here: the guardian is signed out and cannot sign in again.
export function DeleteAccountCard() {
  const [open, setOpen] = useState(false)
  const deleteAccount = useDeleteAccount()

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="font-heading text-lg">Close your account</CardTitle>
        <CardDescription>
          You will be signed out and will not be able to sign in again with this email. Spend or
          check your wallet balance first, as it cannot be used after the account is closed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="outline"
          className="h-11 px-5 text-destructive hover:text-destructive"
          onClick={() => setOpen(true)}
        >
          <Trash2 aria-hidden="true" />
          Close my account
        </Button>
      </CardContent>

      <ConfirmDialog
        open={open}
        // Locked while the request runs, so it cannot be dismissed half way.
        onOpenChange={(next) => {
          if (!deleteAccount.isPending) setOpen(next)
        }}
        title="Close your CareNest account?"
        description="Your account will be closed and you will be signed out straight away. This cannot be undone from the app."
        confirmLabel="Close my account"
        cancelLabel="Keep my account"
        pending={deleteAccount.isPending}
        onConfirm={() => deleteAccount.mutate(undefined, { onError: () => setOpen(false) })}
      />
    </Card>
  )
}
