'use client'

import { ShieldAlert, ShieldQuestion } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormError } from '@/components/forms/form-error'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppForm } from '@/hooks/use-app-form'
import { useUploadProgress } from '@/hooks/use-upload-progress'
import { getErrorMessage } from '@/lib/api/errors'
import { documentSchema } from '@/lib/document-schema'
import { type StaffProfile, VerificationStatus } from '@/types'
import { useUploadVerificationDocument } from '../staff.queries'

const documentFormSchema = z.object({ document: documentSchema })

// Credentials for the admin who reviews the account: an ID or certificate. It is only for staff who
// are not verified yet (unverified, or rejected and waiting for another look). A verified staff
// member never sees it. The document is optional evidence, not a requirement: the backend does not
// need one to verify. Uploading goes to the backend as an image with a progress bar and a preview.
export function VerificationCard({ profile }: { profile: StaffProfile }) {
  const uploadDocument = useUploadVerificationDocument()
  const { progress, report, reset } = useUploadProgress()
  const [serverError, setServerError] = useState<string | null>(null)
  const rejected = profile.verificationStatus === VerificationStatus.REJECTED

  const form = useAppForm({
    defaultValues: { document: null as File | null },
    validators: { onChange: documentFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      if (!value.document) return

      try {
        await uploadDocument.mutateAsync({ file: value.document, onProgress: report })
        formApi.reset({ document: null })
        toast.success('Document uploaded. An admin can review it now.')
      } catch (error) {
        // The chosen file stays, so a failed upload can be retried without picking it again.
        setServerError(getErrorMessage(error))
      } finally {
        reset()
      }
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          {rejected ? (
            <ShieldAlert aria-hidden="true" className="size-5 text-warning" />
          ) : (
            <ShieldQuestion aria-hidden="true" className="size-5 text-info" />
          )}
          Credentials
        </CardTitle>
        <CardDescription>
          {rejected
            ? 'Upload a new document so an admin can review your account again.'
            : 'An admin reviews your account before you can take bookings or trips. They may ask for an ID or certificate: you can upload one here.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rejected && (
          <p className="mb-5 rounded-xl border border-warning/30 bg-warning-soft p-3 text-sm">
            <span className="font-semibold">Your account was not verified.</span>{' '}
            {profile.rejectionReason ?? 'No reason was given.'}
          </p>
        )}

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-col gap-4"
        >
          <form.AppField name="document">
            {(field) => (
              <field.DocumentField
                label="Verification document"
                optional={!rejected}
                currentDocument={profile.verificationDocument}
                progress={progress}
              />
            )}
          </form.AppField>

          <FormError message={serverError} />

          <form.Subscribe selector={(state) => state.values.document !== null}>
            {(hasFile) => (
              <form.AppForm>
                <form.SubmitButton disabled={!hasFile}>Upload document</form.SubmitButton>
              </form.AppForm>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  )
}
