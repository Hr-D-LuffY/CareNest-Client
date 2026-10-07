// The period the revenue and activity charts cover. It lives in the URL (?range=), so a refresh or a
// shared link shows the same board.
export const ANALYTICS_RANGES = [
  { value: '7d', days: 7, label: '7 days', title: 'Last 7 days' },
  { value: '14d', days: 14, label: '14 days', title: 'Last 14 days' },
  { value: '30d', days: 30, label: '30 days', title: 'Last 30 days' },
] as const

export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number]['value']
type AnalyticsRangeOption = (typeof ANALYTICS_RANGES)[number]

export const DEFAULT_ANALYTICS_RANGE: AnalyticsRange = '14d'

// A hand-edited ?range=abc falls back to the default instead of failing.
export function parseAnalyticsRange(raw: string | null | undefined): AnalyticsRange {
  return ANALYTICS_RANGES.find((option) => option.value === raw)?.value ?? DEFAULT_ANALYTICS_RANGE
}

export function getRangeOption(range: AnalyticsRange): AnalyticsRangeOption {
  return ANALYTICS_RANGES.find((option) => option.value === range) ?? ANALYTICS_RANGES[1]
}

// How many days ahead the seat chart looks. The backend refuses past dates for seat counts, so seats
// can only be shown from today onward.
export const OCCUPANCY_DAYS = 14
