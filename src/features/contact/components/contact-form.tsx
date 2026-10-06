'use client'

import { Check, Copy, ExternalLink, Info, Mail, MailCheck, MessageSquare, User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { buttonVariants } from '@/components/ui/button'
import { useAppForm } from '@/hooks/use-app-form'
import { cn } from '@/lib/utils'
import {
  buildGmailUrl,
  buildMailto,
  buildOutlookUrl,
  buildPlainMessage,
  CONTACT_MESSAGE_MAX_LENGTH,
  type ContactInput,
  type ContactPayload,
  contactSchema,
} from '../contact.schema'

type ContactFormProps = {
  // The address the message goes to. Missing means the site owner has not set one yet.
  contactEmail: string | undefined
}

const OPTION_CLASS = cn(buttonVariants({ variant: 'outline' }), 'h-11 w-full justify-start gap-2')

// There is no contact endpoint on the backend (⚠ A7), so this site cannot send a message itself.
// Submitting checks the form, then offers ways to send it from the visitor's own mail: a web mail
// compose window (Gmail, Outlook), their mail app, or a plain copy. A bare mailto: link does nothing
// on a computer with no mail app, so it is only one of the choices. The page must never claim the
// message was sent.
export function ContactForm({ contactEmail }: ContactFormProps) {
  const [ready, setReady] = useState<ContactPayload | null>(null)
  const [copied, setCopied] = useState(false)

  const form = useAppForm({
    defaultValues: { name: '', email: '', subject: '', message: '' } as ContactInput,
    validators: { onChange: contactSchema },
    onSubmit: ({ value }) => {
      setReady(contactSchema.parse(value))
      setCopied(false)
    },
  })

  async function copyMessage(to: string, payload: ContactPayload) {
    try {
      await navigator.clipboard.writeText(buildPlainMessage(to, payload))
      setCopied(true)
    } catch {
      toast.error('Could not copy. Select the message text and copy it yourself.')
    }
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-5"
    >
      {!contactEmail && (
        <div className="flex items-start gap-2 rounded-xl border border-info/30 bg-info-soft p-3 text-sm text-info">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>The contact address is not set up yet, so this form is turned off for now.</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <form.AppField name="name">
          {(field) => (
            <field.TextField
              label="Your name"
              icon={User}
              autoComplete="name"
              placeholder="Your name"
            />
          )}
        </form.AppField>
        <form.AppField name="email">
          {(field) => (
            <field.TextField
              label="Your email"
              type="email"
              icon={Mail}
              autoComplete="email"
              placeholder="you@example.com"
            />
          )}
        </form.AppField>
      </div>

      <form.AppField name="subject">
        {(field) => (
          <field.TextField label="Subject" icon={MessageSquare} placeholder="How can we help?" />
        )}
      </form.AppField>

      <form.AppField name="message">
        {(field) => (
          <field.TextareaField
            label="Message"
            maxLength={CONTACT_MESSAGE_MAX_LENGTH}
            placeholder="Write your message here"
            hint={`Up to ${CONTACT_MESSAGE_MAX_LENGTH} characters.`}
          />
        )}
      </form.AppField>

      <form.AppForm>
        <form.SubmitButton disabled={!contactEmail}>Prepare my email</form.SubmitButton>
      </form.AppForm>

      <p className="text-sm text-muted-foreground">
        This site cannot send email for you. After you press the button, choose where to send your
        message from.
      </p>

      <div aria-live="polite">
        {ready && contactEmail && (
          <div className="flex flex-col gap-3 rounded-2xl border border-success/30 bg-success-soft p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-success">
              <MailCheck className="size-4 shrink-0" aria-hidden="true" />
              Your message is ready. Choose how to send it.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <a
                href={buildGmailUrl(contactEmail, ready)}
                target="_blank"
                rel="noopener noreferrer"
                className={OPTION_CLASS}
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                Open in Gmail
              </a>
              <a
                href={buildOutlookUrl(contactEmail, ready)}
                target="_blank"
                rel="noopener noreferrer"
                className={OPTION_CLASS}
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                Open in Outlook
              </a>
              <a href={buildMailto(contactEmail, ready)} className={OPTION_CLASS}>
                <Mail className="size-4" aria-hidden="true" />
                Open my email app
              </a>
              <button
                type="button"
                onClick={() => copyMessage(contactEmail, ready)}
                className={OPTION_CLASS}
              >
                {copied ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <Copy className="size-4" aria-hidden="true" />
                )}
                {copied ? 'Copied' : 'Copy the message'}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Nothing has been sent yet. Press send in your mail. You can also write to{' '}
              <a
                href={`mailto:${contactEmail}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {contactEmail}
              </a>{' '}
              yourself.
            </p>
          </div>
        )}
      </div>
    </form>
  )
}
