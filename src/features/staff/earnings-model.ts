import type { Earnings } from '@/types'
import type { EarningsPeriod } from './earnings.params'

// Money arrives as strings with two decimals ("1250.50") and is added up here in whole paisa, which are
// integers (a Decimal(12,2) column tops out near 10^12 paisa, far below 2^53), so no float rounding
// creeps in. The plain numbers on a point are only for drawing a chart.

function toPaisa(amount: string): number {
  const negative = amount.trim().startsWith('-')
  const [whole = '0', fraction = ''] = amount.trim().replace(/^[-+]/, '').split('.')
  const paisa = Number(whole || '0') * 100 + Number(fraction.padEnd(2, '0').slice(0, 2))
  return negative ? -paisa : paisa
}

function fromPaisa(paisa: number): string {
  const whole = Math.floor(paisa / 100)
  const fraction = String(paisa % 100).padStart(2, '0')
  return `${whole}.${fraction}`
}

export type EarningsPoint = {
  start: string
  label: string
  fullLabel: string
  isCurrent: boolean
  // Exact amounts, for text (pass them to formatBDT).
  careText: string
  tripsText: string
  totalText: string
  careCount: number
  tripCount: number
  // The same amounts as numbers, only to draw bars and areas.
  care: number
  trips: number
  total: number
}

export type EarningsSeries = {
  points: EarningsPoint[]
  total: string
  care: string
  trips: string
  careCount: number
  tripCount: number
  // The period that earned most, or null when nothing was earned at all.
  best: EarningsPoint | null
  // Whole percent of the total that came from care fees (0 when nothing was earned). Trip fares are
  // the rest.
  careShare: number
  isEmpty: boolean
}

// Puts each period next to what the backend said it earned.
export function buildEarningsSeries(
  periods: EarningsPeriod[],
  earnings: Earnings[],
): EarningsSeries {
  let care = 0
  let trips = 0
  let careCount = 0
  let tripCount = 0
  let best: EarningsPoint | null = null

  const points = periods.map((period, index): EarningsPoint => {
    const answer = earnings[index]
    const careText = answer?.careFees.total ?? '0'
    const tripsText = answer?.tripFares.total ?? '0'
    const totalText = answer?.total ?? '0'
    care += toPaisa(careText)
    trips += toPaisa(tripsText)
    careCount += answer?.careFees.count ?? 0
    tripCount += answer?.tripFares.count ?? 0

    const point: EarningsPoint = {
      start: period.start,
      label: period.label,
      fullLabel: period.fullLabel,
      isCurrent: period.isCurrent,
      careText,
      tripsText,
      totalText,
      careCount: answer?.careFees.count ?? 0,
      tripCount: answer?.tripFares.count ?? 0,
      care: Number(careText),
      trips: Number(tripsText),
      total: Number(totalText),
    }
    if (point.total > 0 && (best === null || point.total > best.total)) best = point
    return point
  })

  const total = care + trips
  return {
    points,
    total: fromPaisa(total),
    care: fromPaisa(care),
    trips: fromPaisa(trips),
    careCount,
    tripCount,
    best,
    careShare: total > 0 ? Math.floor((care * 100) / total) : 0,
    isEmpty: total === 0 && careCount === 0 && tripCount === 0,
  }
}

// Narrows what a chart hands to a tooltip back to the point it was drawn from.
export function isEarningsPoint(value: unknown): value is EarningsPoint {
  return (
    typeof value === 'object' &&
    value !== null &&
    'fullLabel' in value &&
    typeof value.fullLabel === 'string' &&
    'totalText' in value &&
    typeof value.totalText === 'string'
  )
}
