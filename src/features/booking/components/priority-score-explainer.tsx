import { TIER_LABEL } from '@/lib/constants'
import { Tier } from '@/types'
import {
  CANCELLATION_WINDOW_DAYS,
  MAX_CANCELLATION_PENALTY,
  TIER_WEIGHT,
  WAITLIST_WEIGHTS,
} from '../waitlist-score'

// How a waitlist priority score is made up, in plain words. The backend works it out and re-ranks
// every time a seat opens; this only explains it. Plain markup with no hooks.
export function PriorityScoreExplainer() {
  const tiers = [Tier.MONTHLY, Tier.WEEKLY, Tier.DAILY]

  return (
    <section
      aria-labelledby="score-heading"
      className="flex w-full flex-col gap-3 rounded-2xl border bg-card p-5 text-left shadow-soft"
    >
      <h2 id="score-heading" className="font-heading text-lg">
        How the priority score works
      </h2>
      <p className="text-sm text-muted-foreground">
        When a seat opens, the highest score is promoted automatically. Scores are updated each time
        the queue changes.
      </p>
      <ul className="flex flex-col gap-2 text-sm">
        <li>
          <span className="font-semibold tabular-nums">+{WAITLIST_WEIGHTS.waitTimeHours}</span> for
          every hour your child has waited
        </li>
        <li>
          <span className="font-semibold tabular-nums">+{WAITLIST_WEIGHTS.tier}</span> times the
          care tier: {tiers.map((tier) => `${TIER_LABEL[tier]} ${TIER_WEIGHT[tier]}`).join(', ')}
        </li>
        <li>
          <span className="font-semibold tabular-nums">
            −{WAITLIST_WEIGHTS.cancellationPenalty}
          </span>{' '}
          for each booking you cancelled in the last {CANCELLATION_WINDOW_DAYS} days (up to{' '}
          {MAX_CANCELLATION_PENALTY})
        </li>
      </ul>
    </section>
  )
}
