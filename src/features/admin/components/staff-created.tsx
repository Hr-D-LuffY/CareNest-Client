import { ClipboardCheck, UserCog, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { OutcomeView } from '@/components/shared/outcome-view'
import { Button, buttonVariants } from '@/components/ui/button'
import { STAFF_TYPE_LABEL } from '@/lib/constants'
import { formatBDT } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { StaffProfile } from '@/types'

type StaffCreatedProps = {
  staff: StaffProfile
  onAddAnother: () => void
}

// What the backend created: the login and the staff profile, which starts unverified. The next step
// for the admin is to review and verify them. Plain markup apart from the button callback.
export function StaffCreated({ staff, onAddAnother }: StaffCreatedProps) {
  const { user } = staff

  return (
    <OutcomeView
      icon={UserPlus}
      tone="success"
      title="Account created"
      description={`${user.name} can sign in now with the email and password you set. Their account is unverified, so they cannot take bookings or trips until you verify them.`}
      details={[
        { label: 'Name', value: user.name },
        { label: 'Email', value: <span className="break-all">{user.email}</span> },
        { label: 'Role', value: STAFF_TYPE_LABEL[staff.staffType] },
        ...(staff.hourlyRate !== null
          ? [{ label: 'Hourly rate', value: `${formatBDT(staff.hourlyRate)} per hour` }]
          : []),
        ...(staff.perMinuteRate !== null
          ? [{ label: 'Per-minute rate', value: `${formatBDT(staff.perMinuteRate)} per minute` }]
          : []),
      ]}
    >
      <Link
        href={`/admin/staff/${staff.id}`}
        className={cn(buttonVariants(), 'h-11 px-5 text-sm font-semibold')}
      >
        <ClipboardCheck aria-hidden="true" />
        Review and verify
      </Link>
      <Button type="button" variant="outline" className="h-11 px-5 text-sm" onClick={onAddAnother}>
        <UserPlus aria-hidden="true" />
        Add another
      </Button>
      <Link
        href="/admin/staff"
        className={cn(buttonVariants({ variant: 'ghost' }), 'h-11 px-5 text-sm')}
      >
        <UserCog aria-hidden="true" />
        All staff
      </Link>
    </OutcomeView>
  )
}
