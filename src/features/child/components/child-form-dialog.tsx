'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Child } from '@/types'
import { useChildForm } from '../use-child-form'
import {
  AllergiesField,
  ConditionsField,
  childFormTitle,
  DateOfBirthField,
  EmergencyNameField,
  EmergencyPhoneField,
  FormError,
  NameField,
  PhotoFormField,
  SectionTitle,
  TierField,
} from './child-form-fields'

type ChildFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The child being edited, or null to add a new one.
  child: Child | null
}

// Add or edit a child in a wide modal: the photo on the left, the details on the right in short
// rows, so on a desktop the whole form is in view with no scrolling. On a phone the same fields
// stack and the body scrolls under a fixed header and a fixed save button. The form inside is
// mounted only while the modal is open, so every opening starts from the right values.
export function ChildFormDialog({ open, onOpenChange, child }: ChildFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <ChildForm child={child} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function ChildForm({ child, onDone }: { child: Child | null; onDone: () => void }) {
  const { form, progress, serverError } = useChildForm(child, onDone)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="border-b p-4 pr-14 sm:p-6 sm:pr-16">
        <DialogTitle className="text-xl sm:text-2xl">{childFormTitle(child?.name)}</DialogTitle>
        <DialogDescription>
          Staff use these details to look after your child, and to reach you in an emergency.
        </DialogDescription>
      </DialogHeader>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="grid flex-1 gap-8 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
          <div className="lg:border-r lg:pr-10">
            <PhotoFormField
              form={form}
              currentPhoto={child?.profilePhoto}
              progress={progress}
              size={160}
              stacked
            />
          </div>

          <div className="flex flex-col gap-8">
            <section aria-label="About your child" className="flex flex-col gap-5">
              <SectionTitle>About your child</SectionTitle>
              <div className="grid gap-5 sm:grid-cols-2">
                <NameField form={form} />
                <DateOfBirthField form={form} />
              </div>
              <TierField form={form} />
            </section>

            <section aria-label="Health" className="flex flex-col gap-5">
              <SectionTitle>Health</SectionTitle>
              <div className="grid gap-5 sm:grid-cols-2">
                <AllergiesField form={form} />
                <ConditionsField form={form} />
              </div>
            </section>

            <section aria-label="Emergency contact" className="flex flex-col gap-5">
              <SectionTitle>Emergency contact</SectionTitle>
              <div className="grid gap-5 sm:grid-cols-2">
                <EmergencyNameField form={form} />
                <EmergencyPhoneField form={form} />
              </div>
            </section>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t p-4 sm:p-6">
          <FormError message={serverError} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl px-6"
              onClick={onDone}
            >
              Cancel
            </Button>
            <div className="sm:w-56">
              <form.AppForm>
                <form.SubmitButton>{child ? 'Save changes' : 'Add child'}</form.SubmitButton>
              </form.AppForm>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
