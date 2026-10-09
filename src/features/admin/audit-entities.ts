import {
  Bus,
  CalendarCheck,
  DoorOpen,
  ListOrdered,
  type LucideIcon,
  Star,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react'

// The record types the backend writes to the audit log (`AuditLog.entity`), in the order the filter
// lists them. `value` is what the backend matches exactly.
export const AUDIT_ENTITIES: readonly { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'Booking', label: 'Bookings', icon: CalendarCheck },
  { value: 'WaitlistEntry', label: 'Waitlist', icon: ListOrdered },
  { value: 'Room', label: 'Care rooms', icon: DoorOpen },
  { value: 'StaffProfile', label: 'Staff', icon: UserCog },
  { value: 'User', label: 'Users', icon: Users },
  { value: 'TransportBooking', label: 'Rides', icon: Bus },
  { value: 'Vehicle', label: 'Vehicles', icon: Bus },
  { value: 'Rating', label: 'Ratings', icon: Star },
  { value: 'Payment', label: 'Payments', icon: Wallet },
]

export function describeAuditEntity(entity: string): { label: string; icon: LucideIcon } | null {
  const known = AUDIT_ENTITIES.find((option) => option.value === entity)
  return known ? { label: known.label, icon: known.icon } : null
}
