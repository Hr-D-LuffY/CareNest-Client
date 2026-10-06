import { z } from 'zod'

// The backend has no contact endpoint (⚠ A7 in AGENTS.md), so this form only builds an email. The
// limits keep the resulting mailto: link a sensible length.
export const CONTACT_MESSAGE_MAX_LENGTH = 1000

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters'),
  email: z.email('A valid email is required').toLowerCase(),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(120, 'Subject must be at most 120 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(
      CONTACT_MESSAGE_MAX_LENGTH,
      `Message must be at most ${CONTACT_MESSAGE_MAX_LENGTH} characters`,
    ),
})

export type ContactInput = z.input<typeof contactSchema>
export type ContactPayload = z.output<typeof contactSchema>

function buildBody({ name, email, message }: ContactPayload) {
  return `${message}

---
From: ${name} <${email}>`
}

// The same message, ready to be opened in whichever mail service the visitor uses. None of these
// send anything: each one only opens a compose window with the message already written.
export function buildMailto(to: string, payload: ContactPayload) {
  return `mailto:${to}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(buildBody(payload))}`
}

export function buildGmailUrl(to: string, payload: ContactPayload) {
  const query = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to,
    su: payload.subject,
    body: buildBody(payload),
  })
  return `https://mail.google.com/mail/?${query.toString()}`
}

export function buildOutlookUrl(to: string, payload: ContactPayload) {
  const query = new URLSearchParams({ to, subject: payload.subject, body: buildBody(payload) })
  return `https://outlook.live.com/mail/0/deeplink/compose?${query.toString()}`
}

// Plain text for the "Copy message" fallback.
export function buildPlainMessage(to: string, payload: ContactPayload) {
  return `To: ${to}
Subject: ${payload.subject}

${buildBody(payload)}`
}
