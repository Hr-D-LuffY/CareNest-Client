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

// Filter-only value on GET /room?status=
export const RoomStatus = { AVAILABLE: 'AVAILABLE', FULL: 'FULL' } as const
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus]

// Calendar order, Monday first. Use it for pickers and sorting.
export const DAYS_OF_WEEK: readonly DayOfWeek[] = Object.values(DayOfWeek)
