import { Mail, MailOpen, PlayCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BentoCard } from '@/components/landing/bento-card'
import { Reveal } from '@/components/motion/reveal'
import { PageIntro } from '@/components/shared/page-intro'
import { ContactForm } from '@/features/contact/components/contact-form'
import { publicEnv } from '@/lib/public-env'

const TITLE = 'Contact'
const DESCRIPTION = 'Questions about CareNest, care rooms, rides or your wallet? Send us a message.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: `${TITLE} | CareNest`, description: DESCRIPTION, type: 'website' },
}

export default function ContactPage() {
  const contactEmail = publicEnv.NEXT_PUBLIC_CONTACT_EMAIL

  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="We would like to hear from you"
        description="Ask about care rooms, rides, your wallet or how CareNest works. Fill in the form, then send the message from Gmail, Outlook or your own email app."
      />

      <section className="page-container grid gap-6 py-12 sm:py-16 lg:grid-cols-[1fr_1.5fr]">
        <Reveal className="flex flex-col gap-4">
          <BentoCard>
            <span className="grid size-12 place-items-center rounded-2xl bg-info-soft text-info">
              <Mail aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-5 text-xl">Email</h2>
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="mt-2 block text-base font-medium break-all underline underline-offset-4"
              >
                {contactEmail}
              </a>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                The contact address has not been set up yet.
              </p>
            )}
          </BentoCard>

          <BentoCard>
            <span className="grid size-12 place-items-center rounded-2xl bg-success-soft text-success">
              <MailOpen aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-5 text-xl">How the form works</h2>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              The form checks your details and writes the email for you. Then you pick where to send
              it from: Gmail, Outlook, your email app, or copy the text. It goes from your own
              address, so you keep a copy.
            </p>
          </BentoCard>

          <BentoCard>
            <span className="grid size-12 place-items-center rounded-2xl bg-warning-soft text-warning">
              <PlayCircle aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-5 text-xl">Want to look around first?</h2>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">
              The log in page has one-click demo accounts for every role, so you can try CareNest
              without signing up.
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
            >
              Go to log in
            </Link>
          </BentoCard>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-3xl border bg-card p-6 shadow-float sm:p-8">
            <h2 className="text-2xl">Send a message</h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">All fields are required.</p>
            <ContactForm contactEmail={contactEmail} />
          </div>
        </Reveal>
      </section>
    </>
  )
}
