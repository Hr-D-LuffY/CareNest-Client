'use client'

import { ShieldX } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppForm } from '@/hooks/use-app-form'
import type { StaffProfile } from '@/types'

// Mirrors the backend's verify schema: a rejection needs a reason the staff member can act on.
const rejectSchema = z.object({
  rejectionReason: z.string().trim().min(1, 'A rejection reason is required'),
})

type RejectStaffDialogProps = {
  // The staff member being rejected, or null while the dialog is closed.
  staff: StaffProfile | null
  onOpenChange: (open: boolean) => void
  // Called with the reason. The caller runs the (optimistic) request, so the dialog closes at once.
  onReject: (staff: StaffProfile, reason: string) => void
}

// Asks for the reason before a rejection is sent. The reason shows on the staff member's profile, so
// it says what to fix. The form is mounted only while the dialog is open, so every opening starts
// empty.
export function RejectStaffDialog({ staff, onOpenChange, onReject }: RejectStaffDialogProps) {
  return (
    <Dialog open={staff !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {staff && (
          <RejectForm
            staff={staff}
            onCancel={() => onOpenChange(false)}
            onReject={(reason) => {
              onReject(staff, reason)
              onOpenChange(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

type RejectFormProps = {
  staff: StaffProfile
  onCancel: () => void
  onReject: (reason: string) => void
}

function RejectForm({ staff, onCancel, onReject }: RejectFormProps) {
  const form = useAppForm({
    defaultValues: { rejectionReason: '' },
    validators: { onChange: rejectSchema },
    onSubmit: ({ value }) => onReject(value.rejectionReason.trim()),
  })

  return (
    <>
      <DialogHeader className="pr-8">
        <DialogTitle className="flex items-center gap-2 text-xl">
          <ShieldX aria-hidden="true" className="size-5 text-destructive" />
          Reject {staff.user.name}?
        </DialogTitle>
        <DialogDescription>
          They stay signed in but cannot take bookings or trips. The reason is shown on their
          profile, so say what they need to fix before you look again.
        </DialogDescription>
      </DialogHeader>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.AppField name="rejectionReason">
          {(field) => (
            <field.TextareaField
              label="Reason"
              rows={4}
              placeholder="e.g. The ID photo is blurry. Please upload a clear one."
            />
          )}
        </form.AppField>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="h-10 px-4" onClick={onCancel}>
            Keep as is
          </Button>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                variant="destructive"
                className="h-10 px-4"
                disabled={isSubmitting}
              >
                Reject staff member
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </>
  )
}
