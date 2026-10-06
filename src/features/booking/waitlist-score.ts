import { Tier } from '@/types'

// How the backend ranks a waitlist (waitlist.service.ts). Shown to the guardian so the score is not
// a mystery; the backend does every real calculation.
//   priorityScore = 0.5 × hours waited + 0.3 × tier weight − 0.4 × recent cancellations
export const WAITLIST_WEIGHTS = {
  waitTimeHours: 0.5,
  tier: 0.3,
  cancellationPenalty: 0.4,
} as const

export const TIER_WEIGHT: Record<Tier, number> = {
  [Tier.MONTHLY]: 3,
  [Tier.WEEKLY]: 2,
  [Tier.DAILY]: 1,
}

// Cancellations in the last 30 days count against a guardian, up to 5.
export const CANCELLATION_WINDOW_DAYS = 30
export const MAX_CANCELLATION_PENALTY = 5

export function formatPriorityScore(score: number): string {
  return score.toFixed(2)
}
