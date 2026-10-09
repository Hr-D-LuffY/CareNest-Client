import type { BookingStatus, Role, StaffType, Tier, VerificationStatus } from './enums'
import type { AdminUser } from './user'

export type TopRatedStaff = {
  staffId: string
  // The backend sends null if the staff profile can no longer be found.
  name: string | null
  averageScore: number
  ratingCount: number
}

// GET /admin/dashboard-stats. Rates are fractions between 0 and 1.
export type DashboardStats = {
  totalRevenue: string
  activeBookings: number
  roomOccupancyRate: number
  waitlistConversionRate: number
  topRatedStaff: TopRatedStaff[]
}

// GET /admin/audit-logs. `user` is null for system actions (for example WAITLIST_PROMOTED).
export type AuditLog = {
  id: string
  action: string
  entity: string
  entityId: string
  metadata: Record<string, unknown> | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: Role
  } | null
}

// Query params of GET /admin/audit-logs. `entity` is an exact match on the record type ("Booking").
export type AuditLogListParams = {
  page: number
  limit: number
  entity?: string
}

// Query params of GET /admin/users. `role` filters; there is no text search on this endpoint.
export type AdminUserListParams = {
  page: number
  limit: number
  role?: Role
}

// GET /admin/users/:id: the account with the profile behind its role. A guardian comes with their
// children, a count of bookings per status and the newest bookings; a staff member with the id of
// their staff profile (the full profile is GET /admin/staff/:id). An admin has neither.
export type AdminUserDetail = AdminUser & {
  guardianProfile: {
    id: string
    phone: string
    address: string | null
    walletBalance: string
    children: {
      id: string
      name: string
      tier: Tier
      dateOfBirth: string
      profilePhoto: string | null
      allergies: string | null
      conditions: string | null
      emergencyContactName: string
      emergencyContactPhone: string
      createdAt: string
    }[]
    bookingsByStatus: Partial<Record<BookingStatus, number>>
    recentBookings: {
      id: string
      sessionDate: string
      status: BookingStatus
      estimatedFee: string
      finalFee: string | null
      child: { id: string; name: string }
      room: { id: string; name: string }
    }[]
  } | null
  staffProfile: {
    id: string
    staffType: StaffType
    verificationStatus: VerificationStatus
  } | null
}
