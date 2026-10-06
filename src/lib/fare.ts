// The care-fee formula, for showing a price before booking: hours × hourly rate × room multiplier,
// rounded to 2 decimals (half up), the same as the backend (fare.service.ts). The backend still
// computes every real fee; this only explains what a room costs. Money is never a float: each
// value is read as whole digits plus a scale, multiplied exactly, and rounded once at the end.

const DECIMAL_NUMBER = /^\d+(\.\d+)?$/
const MONEY_PLACES = 2
const MINUTES_PER_HOUR = 60

type Scaled = { digits: bigint; scale: number }

function parseDecimal(value: string | number): Scaled | null {
  const text = String(value).trim()
  if (!DECIMAL_NUMBER.test(text)) return null
  const [whole = '0', fraction = ''] = text.split('.')
  return { digits: BigInt(whole + fraction), scale: fraction.length }
}

const powerOfTen = (exponent: number) => BigInt(`1${'0'.repeat(exponent)}`)

// "3" × "200" × "1.25" -> "750.00". Returns null if any value is not a plain decimal number.
export function calculateFare(units: string | number, rate: string, multiplier: string) {
  const factors = [parseDecimal(units), parseDecimal(rate), parseDecimal(multiplier)]
  let digits = BigInt(1)
  let scale = 0
  for (const factor of factors) {
    if (!factor) return null
    digits *= factor.digits
    scale += factor.scale
  }

  if (scale > MONEY_PLACES) {
    const divisor = powerOfTen(scale - MONEY_PLACES)
    const quotient = digits / divisor
    digits = (digits % divisor) * BigInt(2) >= divisor ? quotient + BigInt(1) : quotient
  } else {
    digits *= powerOfTen(MONEY_PLACES - scale)
  }

  const padded = digits.toString().padStart(MONEY_PLACES + 1, '0')
  return `${padded.slice(0, -MONEY_PLACES)}.${padded.slice(-MONEY_PLACES)}`
}

function toMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number)
  return hours * MINUTES_PER_HOUR + minutes
}

// Length of an "HH:mm" window in hours: 09:00-11:30 -> 2.5.
export function hoursBetween(startTime: string, endTime: string): number {
  return (toMinutes(endTime) - toMinutes(startTime)) / MINUTES_PER_HOUR
}
