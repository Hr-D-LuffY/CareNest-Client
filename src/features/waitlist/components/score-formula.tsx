import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  CANCELLATION_WINDOW_DAYS,
  MAX_CANCELLATION_PENALTY,
  TIER_WEIGHT,
  WAITLIST_WEIGHTS,
} from '@/features/booking/waitlist-score'
import { TIER_LABEL } from '@/lib/constants'
import { Tier } from '@/types'

// The priority score in words, for the staff member or admin reading a queue. It opens from a button
// (a tooltip would not work on touch screens or for keyboard users). The backend does the maths and
// ranks again every time the queue changes; this only explains it.
export function ScoreFormula() {
  const tiers = [Tier.MONTHLY, Tier.WEEKLY, Tier.DAILY]

  return (
    <Popover>
      <PopoverTrigger
        render={<Button type="button" variant="outline" className="h-10 gap-2 px-3" />}
      >
        <Info aria-hidden="true" className="size-4" />
        How the score works
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-3 p-4">
        <p className="font-heading text-base">Priority score</p>
        <p className="rounded-lg bg-muted px-3 py-2 font-mono text-xs leading-relaxed">
          {WAITLIST_WEIGHTS.waitTimeHours} × hours waited
          <br />+ {WAITLIST_WEIGHTS.tier} × tier weight
          <br />− {WAITLIST_WEIGHTS.cancellationPenalty} × recent cancellations
        </p>
        <ul className="flex flex-col gap-1.5 text-muted-foreground">
          <li>
            Tier weight:{' '}
            {tiers.map((tier) => `${TIER_LABEL[tier]} ${TIER_WEIGHT[tier]}`).join(', ')}.
          </li>
          <li>
            Cancellations count over the last {CANCELLATION_WINDOW_DAYS} days, up to{' '}
            {MAX_CANCELLATION_PENALTY}.
          </li>
          <li>When a seat opens, the highest score is promoted to a confirmed booking.</li>
        </ul>
      </PopoverContent>
    </Popover>
  )
}
