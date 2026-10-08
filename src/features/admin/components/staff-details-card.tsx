import { Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { STAFF_TYPE_LABEL } from '@/lib/constants'
import { formatBDT, formatDate } from '@/lib/format'
import type { StaffProfile } from '@/types'

type StaffDetailsCardProps = {
  staff: StaffProfile
  onEdit: () => void
}

function Fact({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div
      className={wide ? 'flex min-w-0 flex-col gap-1 sm:col-span-2' : 'flex min-w-0 flex-col gap-1'}
    >
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className={wide ? 'break-words whitespace-pre-line' : 'break-words'}>{children}</dd>
    </div>
  )
}

// Everything on the staff member's profile, to read, with "Edit details" for the fields an admin can
// change. Plain markup apart from the button callback.
export function StaffDetailsCard({ staff, onEdit }: StaffDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Details</CardTitle>
        <CardDescription>
          How this person appears to guardians, and what they are paid.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Fact label="Full name">{staff.user.name}</Fact>
          <Fact label="Email">
            <span className="break-all">{staff.user.email}</span>
          </Fact>
          <Fact label="Role">{STAFF_TYPE_LABEL[staff.staffType]}</Fact>
          <Fact label="Experience">
            {staff.experience} {staff.experience === 1 ? 'year' : 'years'}
          </Fact>
          {staff.hourlyRate !== null && (
            <Fact label="Hourly rate">
              <span className="tabular-nums">{formatBDT(staff.hourlyRate)} per hour</span>
            </Fact>
          )}
          {staff.perMinuteRate !== null && (
            <Fact label="Per-minute rate">
              <span className="tabular-nums">{formatBDT(staff.perMinuteRate)} per minute</span>
            </Fact>
          )}
          <Fact label="Joined">{formatDate(staff.createdAt)}</Fact>
          <Fact label="About them" wide>
            {staff.bio ?? <span className="text-muted-foreground">Nothing written yet.</span>}
          </Fact>
        </dl>

        <div className="border-t pt-5">
          <Button type="button" variant="outline" className="h-11 px-5" onClick={onEdit}>
            <Pencil aria-hidden="true" />
            Edit details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
