import type { Analytics } from './admin.server'
import { changePercent, type PeriodSummary, summarise } from './analytics-model'

// What the three layouts share: the live numbers plus the few figures worked out from them once
// (the period's totals, how they moved against the period before, and the plain-language highlights).
export type BoardData = {
  analytics: Analytics
  // null when the audit log could not be read.
  summary: PeriodSummary | null
  previous: PeriodSummary | null
  // Whole percent against the period before, or null when there is nothing to compare with.
  revenueChange: number | null
  // "the 14 days before", for sentences that compare with the earlier period.
  compareTo: string
}

export function buildBoard(analytics: Analytics): BoardData {
  const history = analytics.history.ok ? analytics.history.data : null
  const summary = history ? summarise(history.days) : null
  // If older events may be missing from the read, the earlier period would look smaller than it was,
  // so it is not compared.
  const previous = history && !history.truncated ? summarise(history.previousDays) : null

  return {
    analytics,
    summary,
    previous,
    revenueChange:
      summary && previous ? changePercent(summary.revenueCents, previous.revenueCents) : null,
    compareTo: `the ${analytics.rangeDays} days before`,
  }
}
