import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from '@/components/motion/reveal'
import { CURRENCY_CODE, TOP_UP_MAX_AMOUNT, TOP_UP_MIN_AMOUNT } from '@/lib/constants'

const QUESTIONS = [
  {
    question: 'What is CareNest?',
    answer:
      'CareNest is a daycare platform. A daycare uses it to run its rooms, its staff and its records. Families use it to book a seat for their child, arrange a supervised ride and pay from one wallet. Sitters and drivers use it to check children in and out and run the rides.',
  },
  {
    question: 'Who can create an account?',
    answer:
      'Parents and guardians sign up themselves. Sitter, driver and admin accounts are created by an admin, and staff are verified before they can take a booking.',
  },
  {
    question: 'What happens if the room I want is full?',
    answer:
      'Your child joins the waitlist with a priority score instead of being turned away. When someone cancels, the child at the top of the queue is promoted automatically.',
  },
  {
    question: 'How do I pay?',
    answer: `You top up a wallet with bKash, between ${TOP_UP_MIN_AMOUNT} and ${TOP_UP_MAX_AMOUNT.toLocaleString('en-US')} ${CURRENCY_CODE} at a time, and care sessions and rides are paid from that balance. bKash runs in sandbox mode here, so no real money moves.`,
  },
  {
    question: 'Can I look around before I sign up?',
    answer:
      'Yes. The log in page has one-click demo accounts for a parent, a sitter, a driver and an admin.',
  },
] as const

// Native <details> elements: keyboard and screen-reader friendly with no JavaScript. The heading
// sits in the left column, the questions in the right one.
// `anchorId` is the id of the section, so a page that puts the id on a wrapper (the chapter) can pass
// another one and keep "faq" unique.
export function Faq({
  withHeading = true,
  anchorId = 'faq',
}: {
  withHeading?: boolean
  anchorId?: string
}) {
  const list = (
    <Reveal className="divide-y border-y">
      {QUESTIONS.map(({ question, answer }) => (
        <details key={question} className="group py-1">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-3 text-lg font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
            {question}
            <ChevronDown
              aria-hidden="true"
              className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <p className="pb-4 text-base text-pretty text-muted-foreground">{answer}</p>
        </details>
      ))}
    </Reveal>
  )

  const contact = (
    <p className="text-base text-pretty text-muted-foreground">
      Something else on your mind?{' '}
      <Link
        href="/contact"
        className="font-medium text-foreground underline underline-offset-4 hover:text-info"
      >
        Get in touch
      </Link>
      .
    </p>
  )

  // Under a chapter intro the list stands alone in one column.
  if (!withHeading) {
    return (
      <section id={anchorId} className="page-container scroll-mt-20 pt-10 pb-16 sm:pb-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {list}
          {contact}
        </div>
      </section>
    )
  }

  return (
    <section id={anchorId} className="page-container scroll-mt-20 pb-16 sm:pb-24">
      <div className="grid gap-10 lg:grid-cols-[4fr_7fr] lg:gap-16">
        <Reveal>
          <p className="text-sm font-semibold tracking-wide text-info uppercase">Questions</p>
          <h2 className="mt-3 text-3xl text-balance sm:text-4xl">Quick answers</h2>
          <div className="mt-4">{contact}</div>
        </Reveal>
        {list}
      </div>
    </section>
  )
}
