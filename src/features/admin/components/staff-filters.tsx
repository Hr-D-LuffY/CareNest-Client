'use client'

import { FilterX } from 'lucide-react'
import { FilterSelect } from '@/components/shared/filter-select'
import { SearchInput } from '@/components/shared/search-input'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { STAFF_TYPE_LABEL } from '@/lib/constants'
import { StaffType, VerificationStatus } from '@/types'
import {
  ADMIN_STAFF_FILTER_KEYS,
  type AdminStaffViewParams,
  hasAdminStaffFilters,
} from '../admin-staff.params'

const TYPE_OPTIONS = [
  { value: '', label: 'Any role' },
  { value: StaffType.SITTER, label: STAFF_TYPE_LABEL.SITTER },
  { value: StaffType.DRIVER, label: STAFF_TYPE_LABEL.DRIVER },
  { value: StaffType.BOTH, label: STAFF_TYPE_LABEL.BOTH },
] as const

const STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: VerificationStatus.UNVERIFIED, label: 'Unverified' },
  { value: VerificationStatus.VERIFIED, label: 'Verified' },
  { value: VerificationStatus.REJECTED, label: 'Rejected' },
] as const

type StaffFiltersProps = {
  params: AdminStaffViewParams
  // How many staff match, once known.
  total?: number
}

// Search, role and verification status for the staff list. Every control writes to the URL (through
// useQueryParams), and the list reads it back, so a refresh or a shared link shows the same staff.
export function StaffFilters({ params, total }: StaffFiltersProps) {
  const query = useQueryParams()
  const filtered = hasAdminStaffFilters(params)

  return (
    <section
      aria-label="Find staff"
      className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-soft sm:p-5"
    >
      <SearchInput
        value={params.q ?? ''}
        onSearch={(text) => query.set({ q: text })}
        label="Search staff"
        placeholder="Search by name or email"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <FilterSelect
          label="Role"
          value={params.type ?? ''}
          options={TYPE_OPTIONS}
          onChange={(type) => query.set({ type })}
        />
        <FilterSelect
          label="Verification"
          value={params.status ?? ''}
          options={STATUS_OPTIONS}
          onChange={(status) => query.set({ status })}
        />
      </div>

      <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
        {total === undefined ? (
          <span />
        ) : (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">{total}</span> staff
            {filtered && ' match your filters'}
          </p>
        )}
        {filtered && (
          <Button
            type="button"
            variant="ghost"
            className="h-10 px-3"
            onClick={() => query.clear(...ADMIN_STAFF_FILTER_KEYS)}
          >
            <FilterX aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>
    </section>
  )
}
