import { formatBDT } from '@/lib/format'

export type AuditDetail = { label: string; value: string }

const KEY_LABELS: Record<string, string> = {
  roomId: 'Room',
  childId: 'Child',
  bookingId: 'Booking',
  staffId: 'Staff',
  vehicleId: 'Vehicle',
  plateNumber: 'Plate',
  vehicleType: 'Vehicle type',
  priorityScore: 'Priority score',
  balanceAfter: 'Balance after',
  finalFee: 'Final fee',
  durationMinutes: 'Duration',
  rejectionReason: 'Reason',
}

// Amounts the backend sends as strings of taka.
const MONEY_KEYS = new Set(['amount', 'balanceAfter', 'finalFee', 'fare'])

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ENUM_LIKE = /^[A-Z][A-Z_]+$/
const MAX_TEXT = 80

// "roomId" -> "Room id", for a key the table has no label for.
function humanizeKey(key: string): string {
  const spaced = key.replace(/([A-Z])/g, ' $1').toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

// "CONFIRMED" -> "Confirmed"
function humanizeEnum(value: string): string {
  const spaced = value.toLowerCase().replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function formatValue(key: string, value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') {
    if (key === 'durationMinutes') return `${value} min`
    return String(Number(value.toFixed(2)))
  }
  if (typeof value === 'string') {
    if (MONEY_KEYS.has(key) && Number.isFinite(Number(value))) return formatBDT(value)
    // An id is long and meaningless to read; the first part is enough to tell two apart.
    if (UUID.test(value)) return `#${value.slice(0, 8)}`
    if (ENUM_LIKE.test(value)) return humanizeEnum(value)
    return value.length > MAX_TEXT ? `${value.slice(0, MAX_TEXT)}…` : value
  }
  const json = JSON.stringify(value)
  return json.length > MAX_TEXT ? `${json.slice(0, MAX_TEXT)}…` : json
}

// The facts the backend stored with an audit event, as label/value pairs for a table cell. A
// `from`/`to` pair reads as one "Change" line. Empty values are left out.
export function describeAuditMetadata(metadata: Record<string, unknown> | null): AuditDetail[] {
  if (!metadata) return []
  const details: AuditDetail[] = []

  const from = formatValue('from', metadata.from)
  const to = formatValue('to', metadata.to)
  if (from && to) details.push({ label: 'Change', value: `${from} → ${to}` })

  for (const [key, raw] of Object.entries(metadata)) {
    if (from && to && (key === 'from' || key === 'to')) continue
    const value = formatValue(key, raw)
    if (value) details.push({ label: KEY_LABELS[key] ?? humanizeKey(key), value })
  }
  return details
}
