'use client'

import { Baby, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useChildrenQuery } from '@/features/child/child.queries'
import { useQueryParams } from '@/hooks/use-query-params'
import { TIER_LABEL } from '@/lib/constants'
import { formatAge } from '@/lib/format'
import { cn } from '@/lib/utils'
import { WIZARD_CHILD_PARAMS } from '../booking.params'
import type { BookingFormApi } from '../use-booking-form'

const SKELETON_IDS = ['a', 'b', 'c'] as const

// Step 1: which of the guardian's children the seat is for. The pick is written to the URL (?child=),
// so a refresh or a shared link keeps it.
export function ChildStep({ form }: { form: BookingFormApi }) {
  const query = useQueryParams()
  const { data, isPending, isError, refetch } = useChildrenQuery(WIZARD_CHILD_PARAMS)

  function renderChoices() {
    if (isPending) {
      return (
        <div aria-busy="true" aria-live="polite" className="grid gap-2 sm:grid-cols-3">
          <span className="sr-only">Loading your children</span>
          {SKELETON_IDS.map((id) => (
            <Skeleton key={id} className="h-16 rounded-xl" />
          ))}
        </div>
      )
    }
    if (isError && !data) return <ListErrorState onRetry={() => refetch()} />

    if (!data || data.items.length === 0) {
      return (
        <EmptyState
          icon={Baby}
          title="Add a child first"
          description="A seat is booked for one of your children, so add their details once, then come back."
          action={
            <Link
              href="/dashboard/children"
              className={cn(
                buttonVariants(),
                'h-11 bg-cta px-5 font-semibold text-cta-foreground hover:bg-cta/90',
              )}
            >
              <UserPlus aria-hidden="true" />
              Add a child
            </Link>
          }
        />
      )
    }

    const options = data.items.map((child) => ({
      value: child.id,
      label: child.name,
      description: `${TIER_LABEL[child.tier]} tier · ${formatAge(child.dateOfBirth)}`,
    }))

    return (
      <form.AppField
        name="childId"
        listeners={{ onChange: ({ value }) => query.set({ child: value }) }}
      >
        {(field) => <field.ChoiceField label="Choose a child" options={options} />}
      </form.AppField>
    )
  }

  return (
    <section aria-labelledby="step-heading" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id="step-heading" tabIndex={-1} className="text-xl outline-none">
          Who is this booking for?
        </h2>
        <p className="text-sm text-muted-foreground">
          Staff see this child&apos;s health notes and emergency contact for the session.
        </p>
      </div>
      {renderChoices()}
    </section>
  )
}
