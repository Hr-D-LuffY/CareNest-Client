// Mirrors prisma/schema/enums.prisma in the backend. Each enum is an `as const` object plus a union
// type of the same name, so it works as a value (Role.ADMIN, z.enum(Role)) and as a type (Role).

export const Role = { GUARDIAN: 'GUARDIAN', STAFF: 'STAFF', ADMIN: 'ADMIN' } as const
export type Role = (typeof Role)[keyof typeof Role]

export const StaffType = { SITTER: 'SITTER', DRIVER: 'DRIVER', BOTH: 'BOTH' } as const
export type StaffType = (typeof StaffType)[keyof typeof StaffType]

export const VerificationStatus = {
  UNVERIFIED: 'UNVERIFIED',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus]

export const Tier = { DAILY: 'DAILY', WEEKLY: 'WEEKLY', MONTHLY: 'MONTHLY' } as const
export type Tier = (typeof Tier)[keyof typeof Tier]

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus]

export const WaitlistStatus = {
  PENDING: 'PENDING',
  PROMOTED: 'PROMOTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const
export type WaitlistStatus = (typeof WaitlistStatus)[keyof typeof WaitlistStatus]

export const WalletTransactionType = {
  TOPUP: 'TOPUP',
  CARE_FEE: 'CARE_FEE',
  TRANSPORT_FARE: 'TRANSPORT_FARE',
} as const
export type WalletTransactionType =
  (typeof WalletTransactionType)[keyof typeof WalletTransactionType]

export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const DayOfWeek = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY',
} as const
export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek]

export const VehicleType = { CAR: 'CAR', VAN: 'VAN', BUS: 'BUS' } as const
export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType]

export const TransportStatus = {
  REQUESTED: 'REQUESTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
export type TransportStatus = (typeof TransportStatus)[keyof typeof TransportStatus]

// The AI providers behind the backend gateway (backend: config/index.ts). Only ever shown as a label.
export const AiProviderName = { GEMINI: 'gemini', GROQ: 'groq', OPENROUTER: 'openrouter' } as const
export type AiProviderName = (typeof AiProviderName)[keyof typeof AiProviderName]

// Admin insights (backend: lib/ai/anomaly-rules.ts).
export const AnomalySeverity = { INFO: 'INFO', WARNING: 'WARNING', CRITICAL: 'CRITICAL' } as const
export type AnomalySeverity = (typeof AnomalySeverity)[keyof typeof AnomalySeverity]

export const AnomalyType = {
  CANCELLATION_SPIKE: 'CANCELLATION_SPIKE',
  REPEAT_CANCELLER: 'REPEAT_CANCELLER',
  STAFF_RATING_DROP: 'STAFF_RATING_DROP',
  REVENUE_DROP: 'REVENUE_DROP',
  WALLET_SHORTFALLS: 'WALLET_SHORTFALLS',
  ROOM_HIGH_DEMAND: 'ROOM_HIGH_DEMAND',
  ROOM_LOW_OCCUPANCY: 'ROOM_LOW_OCCUPANCY',
  STALE_VERIFICATION: 'STALE_VERIFICATION',
} as const
export type AnomalyType = (typeof AnomalyType)[keyof typeof AnomalyType]

export const AnomalyEntityType = {
  PLATFORM: 'PLATFORM',
  GUARDIAN: 'GUARDIAN',
  STAFF: 'STAFF',
  ROOM: 'ROOM',
} as const
export type AnomalyEntityType = (typeof AnomalyEntityType)[keyof typeof AnomalyEntityType]

// Who wrote an insights briefing: a model, or the backend's template when no provider could answer.
export const InsightsSource = { AI: 'AI', RULES: 'RULES' } as const
export type InsightsSource = (typeof InsightsSource)[keyof typeof InsightsSource]

// Filter-only value on GET /room?status=
export const RoomStatus = { AVAILABLE: 'AVAILABLE', FULL: 'FULL' } as const
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus]

// Calendar order, Monday first. Use it for pickers and sorting.
export const DAYS_OF_WEEK: readonly DayOfWeek[] = Object.values(DayOfWeek)
