import type { Role, StaffType, VerificationStatus } from './enums'

export type User = {
  id: string
  name: string
  email: string
  role: Role
  profilePhoto: string | null
  createdAt?: string
}

// POST /auth/login
export type LoginResult = {
  accessToken: string
  refreshToken: string
  user: User
}

// POST /auth/refresh-token
export type RefreshResult = {
  accessToken: string
  refreshToken: string
}

// Decoded JWT payload (the backend signs { userId, email, role }).
export type AccessTokenPayload = {
  userId: string
  email: string
  role: Role
  iat: number
  exp: number
}

// What the frontend keeps in the readable `cn_session` cookie and shares through SessionProvider.
export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
  profilePhoto: string | null
  staffType?: StaffType
  verificationStatus?: VerificationStatus
}

// GET /guardian/me
export type GuardianProfile = User & {
  updatedAt: string
  guardianProfile: {
    id: string
    phone: string
    address: string | null
    walletBalance: string
  }
}

// GET /admin/users
export type AdminUser = User & {
  updatedAt: string
}
