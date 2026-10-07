import { DayOfWeek, Role, StaffType, Tier, VehicleType } from '@/types/enums'

// Where each role lands after login, and the URL prefix that only that role may open.
export const ROLE_HOME_PATH: Record<Role, string> = {
  [Role.GUARDIAN]: '/dashboard',
  [Role.STAFF]: '/staff',
  [Role.ADMIN]: '/admin',
}

export const ROLE_PATH_PREFIX: Record<Role, string> = ROLE_HOME_PATH

// The bKash return pages belong to the guardian who is topping up (see proxy.ts).
export const PAYMENT_PATH_PREFIX = '/payment'

// Only for visitors who are not logged in; a logged-in user is sent to their own dashboard.
export const GUEST_ONLY_PATHS = ['/login', '/register', '/forgot-password']

export const ROLE_LABEL: Record<Role, string> = {
  [Role.GUARDIAN]: 'Guardian',
  [Role.STAFF]: 'Staff',
  [Role.ADMIN]: 'Admin',
}

export const STAFF_TYPE_LABEL: Record<StaffType, string> = {
  [StaffType.SITTER]: 'Sitter',
  [StaffType.DRIVER]: 'Driver',
  [StaffType.BOTH]: 'Sitter & driver',
}

export const TIER_LABEL: Record<Tier, string> = {
  [Tier.DAILY]: 'Daily',
  [Tier.WEEKLY]: 'Weekly',
  [Tier.MONTHLY]: 'Monthly',
}

export const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  [VehicleType.CAR]: 'Car',
  [VehicleType.VAN]: 'Van',
  [VehicleType.BUS]: 'Bus',
}

export const DAY_LABEL: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Monday',
  [DayOfWeek.TUESDAY]: 'Tuesday',
  [DayOfWeek.WEDNESDAY]: 'Wednesday',
  [DayOfWeek.THURSDAY]: 'Thursday',
  [DayOfWeek.FRIDAY]: 'Friday',
  [DayOfWeek.SATURDAY]: 'Saturday',
  [DayOfWeek.SUNDAY]: 'Sunday',
}

// Session cookies, all httpOnly on the frontend domain (see AGENTS.md → Architecture).
export const ACCESS_COOKIE = 'cn_access'
export const REFRESH_COOKIE = 'cn_refresh'
export const SESSION_COOKIE = 'cn_session'

// Pagination: the backend defaults to 10 and caps at 100.
export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

// Wallet top-up limits in BDT (backend: payment.interface.ts).
export const TOP_UP_MIN_AMOUNT = 10
export const TOP_UP_MAX_AMOUNT = 25000
export const CURRENCY_CODE = 'BDT'

// Flat charge every supervised ride starts from, in BDT (backend: transport.service.ts).
export const TRANSPORT_BASE_FARE = 50

// Password rules (backend: auth.interface.ts).
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

// File uploads: JPEG, PNG or WEBP under 5 MB (backend: middleware/upload.ts).
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

// Every timestamp is shown in the platform's local time, not the server's (Vercel runs in UTC).
export const APP_TIME_ZONE = 'Asia/Dhaka'

// Search inputs wait this long after the last keystroke before updating the URL.
export const SEARCH_DEBOUNCE_MS = 400

// Rating scale and comment length (backend: rating.interface.ts).
export const RATING_MIN = 1
export const RATING_MAX = 5
export const RATING_COMMENT_MAX_LENGTH = 500

// Vehicles (backend: transport.interface.ts).
export const PLATE_NUMBER_MIN_LENGTH = 3
export const PLATE_NUMBER_MAX_LENGTH = 20
export const VEHICLE_MIN_CAPACITY = 1
export const VEHICLE_MAX_CAPACITY = 60

// Ride addresses (backend: transport.interface.ts).
export const ADDRESS_MIN_LENGTH = 5
export const ADDRESS_MAX_LENGTH = 255
