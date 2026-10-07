import type { Role } from './enums'

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
