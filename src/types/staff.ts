import type {
  BookingStatus,
  DayOfWeek,
  StaffType,
  Tier,
  TransportStatus,
  VehicleType,
  VerificationStatus,
} from './enums'

export type StaffProfile = {
  id: string
  staffType: StaffType
  bio: string | null
  experience: number
  hourlyRate: string | null
  perMinuteRate: string | null
  verificationStatus: VerificationStatus
  verifiedAt: string | null
  rejectionReason: string | null
  verificationDocument: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    profilePhoto: string | null
  }
}

// Query params of GET /admin/staff. `search` matches the name or the email.
export type AdminStaffListParams = {
  page: number
  limit: number
  verificationStatus?: VerificationStatus
  staffType?: StaffType
  search?: string
}

// POST /admin/staff body. A sitter needs `hourlyRate`, a driver `perMinuteRate` and BOTH needs
// both. Experience defaults to 0 on the backend.
export type CreateStaffPayload = {
  name: string
  email: string
  password: string
  staffType: StaffType
  experience?: number
  bio?: string
  hourlyRate?: number
  perMinuteRate?: number
}

// PATCH /admin/staff/:id body: any of the fields, at least one. The email and verification are not
// editable here. A rate and the bio can be cleared with null, but the rate(s) the staff type needs
// must remain.
export type UpdateStaffPayload = {
  name?: string
  staffType?: StaffType
  bio?: string | null
  experience?: number
  hourlyRate?: number | null
  perMinuteRate?: number | null
}

// PATCH /admin/staff/:id/verify body: approve, or reject with a reason the staff member can act on.
export type VerifyStaffPayload =
  | { status: 'VERIFIED' }
  | { status: 'REJECTED'; rejectionReason: string }

export type AvailabilitySlot = {
  id: string
  staffId: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
}

// PATCH /staff/me body: any of the fields, at least one. Type, rates and verification are
// admin-managed. A bio cannot be blank, so clearing it is sent as null.
export type UpdateStaffProfilePayload = {
  name?: string
  bio?: string | null
  experience?: number
}

// POST /staff/availability body. Times are 24-hour "HH:mm"; a slot must not overlap another one.
export type SlotPayload = {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
}

// PATCH /staff/availability/:id body: any of the fields, at least one.
export type UpdateSlotPayload = Partial<SlotPayload>

// Query params of GET /staff/me/bookings. `date` ("YYYY-MM-DD") keeps one session day only.
export type StaffTaskListParams = {
  page: number
  limit: number
  date?: string
}

// Query params of GET /staff/me/trips. `status` filters; paging is 1-based.
export type StaffTripListParams = {
  page: number
  limit: number
  status?: TransportStatus
}

// GET /staff/me/bookings: confirmed bookings still needing a check-in or check-out.
export type AssignedBooking = {
  id: string
  sessionDate: string
  status: BookingStatus
  child: {
    id: string
    name: string
    tier: Tier
    allergies: string | null
    conditions: string | null
    emergencyContactName: string
    emergencyContactPhone: string
  }
  room: {
    id: string
    name: string
    dayOfWeek: DayOfWeek
    startTime: string
    endTime: string
  }
  checkinLog: {
    checkInAt: string
    checkOutAt: string | null
  } | null
}

export type TripLog = {
  tripStart: string
  tripEnd: string | null
  durationMinutes: number | null
  fare: string | null
}

// GET /staff/me/trips
export type Trip = {
  id: string
  status: TransportStatus
  pickupAddress: string
  dropoffAddress: string
  baseFare: string
  booking: {
    id: string
    sessionDate: string
    child: { id: string; name: string }
  }
  vehicle: {
    id: string
    plateNumber: string
    vehicleType: VehicleType
  }
  tripLog: TripLog | null
}

// GET /staff/me/earnings
export type Earnings = {
  from: string | null
  to: string | null
  careFees: { total: string; count: number }
  tripFares: { total: string; count: number }
  total: string
}
