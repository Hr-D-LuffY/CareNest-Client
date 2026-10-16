import { Reveal } from '@/components/motion/reveal'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import {
  CURRENCY_CODE,
  RATING_MAX,
  RATING_MIN,
  TOP_UP_MAX_AMOUNT,
  TRANSPORT_BASE_FARE,
} from '@/lib/constants'

// The values are the product's own fixed rules (see /services and lib/constants.ts), not usage
// counts: there are no users to count, so nothing here pretends otherwise.
const NUMBERS = [
  { value: '3', label: 'Care tiers to choose from: Daily, Weekly and Monthly' },
  {
    value: `${TRANSPORT_BASE_FARE} ${CURRENCY_CODE}`,
    label: 'The flat base fare every supervised ride starts from',
  },
  {
    value: TOP_UP_MAX_AMOUNT.toLocaleString('en-US'),
    label: `${CURRENCY_CODE}, the most a single wallet top-up can be`,
  },
  {
    value: `${RATING_MIN}–${RATING_MAX}`,
    label: 'The star scale for rating a sitter or a driver',
  },
] as const

// A full-width band in the inverted colours (dark on a light page, light on a dark one), four big
// numbers and thin dividers, no boxes. It closes the "what you get" chapter with the fine print
// stated up front.
export function NumbersBand() {
  return (
    <section
      id="numbers"
      aria-labelledby="numbers-heading"
      className="scroll-mt-28 bg-foreground text-background"
    >
      <div className="page-container py-14 sm:py-16">
        <Reveal className="flex max-w-2xl flex-col gap-1">
          <p className="text-sm font-semibold tracking-wide text-background/70 uppercase">
            By design
          </p>
          <h3 id="numbers-heading" className="text-2xl text-balance sm:text-3xl">
            The rules it is built on
          </h3>
          <p className="text-background/70">
            Fixed limits and formulas, worked out by the server every time.
          </p>
        </Reveal>

        <Stagger className="mt-10 grid grid-cols-2 gap-y-10 lg:grid-cols-4" gap={0.1}>
          {NUMBERS.map((item, index) => (
            <StaggerItem
              key={item.label}
              className={index === 0 ? 'pr-4' : 'border-l border-background/20 pl-5 sm:pl-8'}
            >
              <dl className="flex flex-col gap-2">
                <dt className="sr-only">{item.label}</dt>
                <dd className="font-heading text-4xl tracking-tight sm:text-5xl">{item.value}</dd>
                <dd className="max-w-48 text-sm text-pretty text-background/70">{item.label}</dd>
              </dl>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
