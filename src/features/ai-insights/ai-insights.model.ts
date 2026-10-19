import type { Anomaly, PeriodComparison } from '@/types'
import type { AnomalySeverity } from '@/types/enums'

// Most serious first, so a critical finding is never below an informational one.
const SEVERITY_RANK: Record<AnomalySeverity, number> = {
  CRITICAL: 0,
  WARNING: 1,
  INFO: 2,
}

export function sortAnomalies(anomalies: Anomaly[]): Anomaly[] {
  return [...anomalies].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
}

// "Generated just now" / "5 min ago" / "2 h ago". A cached briefing keeps its original time, so this
// is how old the text really is. `now` is null before the first client render (see useNow), and the
// label then carries no time so the server HTML and hydration agree.
export function describeAge(generatedAt: string, now: number | null): string {
  if (now === null) return 'Generated recently'
  const minutes = Math.max(0, Math.round((now - new Date(generatedAt).getTime()) / 60_000))
  if (minutes < 1) return 'Generated just now'
  if (minutes < 60) return `Generated ${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `Generated ${hours} h ago`
  return `Generated ${Math.round(hours / 24)} d ago`
}

export type Trend = { direction: 'up' | 'down' | 'flat'; text: string }

// How a figure moved against the period before: "Up 12% on the previous 28 days". With nothing to
// compare against, it says so instead of printing a meaningless infinity.
export function describeTrend({ current, previous }: PeriodComparison, periodDays: number): Trend {
  if (previous === 0) {
    return {
      direction: current > 0 ? 'up' : 'flat',
      text: current > 0 ? `New: none in the previous ${periodDays} days` : 'No change',
    }
  }
  const change = Math.round(((current - previous) / previous) * 100)
  if (change === 0) return { direction: 'flat', text: `Same as the previous ${periodDays} days` }
  return {
    direction: change > 0 ? 'up' : 'down',
    text: `${change > 0 ? 'Up' : 'Down'} ${Math.abs(change)}% on the previous ${periodDays} days`,
  }
}
