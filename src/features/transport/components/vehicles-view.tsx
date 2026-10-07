'use client'

import { Car, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { Button } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { useSession } from '@/hooks/use-session'
import { cn } from '@/lib/utils'
import { type Vehicle, VerificationStatus } from '@/types'
import { useDeleteVehicle, useMyVehiclesQuery } from '../transport.queries'
import { parseVehicleViewParams, toMyVehicleListParams } from '../vehicle.params'
import { VehicleCards } from './vehicle-cards'
import { VehicleFormDialog } from './vehicle-form-dialog'
import { VehicleListSkeleton } from './vehicle-skeleton'

type FormState = { open: boolean; vehicle: Vehicle | null }

// The driver's vehicles: add, edit, remove. The URL (?page=) is the single source of truth for the
// page, so a refresh or a shared link shows the same one. The server page has already prefetched the
// first load, so this normally renders with data. Removing is optimistic: the card goes at once and
// comes back if the backend refuses (a vehicle with ride history stays).
export function VehiclesView() {
  const query = useQueryParams()
  const session = useSession()
  const params = parseVehicleViewParams({ page: query.get('page') })
  const { data, isPending, isError, isFetching, refetch } = useMyVehiclesQuery(
    toMyVehicleListParams(params),
  )
  const deleteVehicle = useDeleteVehicle()

  const [formState, setFormState] = useState<FormState>({ open: false, vehicle: null })
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)

  const items = data?.items ?? []
  const total = data?.meta.total ?? 0
  const lastPage = data ? Math.max(1, Math.ceil(data.meta.total / data.meta.limit)) : 1
  const verified = session.verificationStatus === VerificationStatus.VERIFIED

  // Removing the last vehicle on a later page (or a hand-edited ?page=9) leaves an empty page. Step
  // back to the last page that has vehicles instead of showing "nothing here".
  useEffect(() => {
    if (data && total > 0 && params.page > lastPage) query.setPage(lastPage)
  }, [data, total, params.page, lastPage, query])

  // `vehicle` is the one being edited, or null to add a new one.
  function openForm(vehicle: Vehicle | null) {
    setFormState({ open: true, vehicle })
  }

  function renderList() {
    if (isPending) return <VehicleListSkeleton />
    if (isError && !data) return <ListErrorState onRetry={() => refetch()} />

    if (total === 0) {
      return (
        <EmptyState
          icon={Car}
          title="No vehicles yet"
          description="Register the vehicle you drive. Once your account is verified, guardians can pick it when they request a ride."
          action={
            <Button
              type="button"
              className="h-11 bg-cta px-5 font-semibold text-cta-foreground hover:bg-cta/90"
              onClick={() => openForm(null)}
            >
              <Plus aria-hidden="true" />
              Add your first vehicle
            </Button>
          }
        />
      )
    }

    return <VehicleCards items={items} onEdit={openForm} onDelete={setVehicleToDelete} />
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl text-balance md:text-3xl">Vehicles</h1>
            <p className="text-muted-foreground">
              The vehicles you drive guardians&apos; children in.{' '}
              {verified
                ? 'Guardians can pick them when they request a ride.'
                : 'Guardians can pick them once an admin verifies your account.'}
            </p>
          </div>
          <Button
            type="button"
            className="h-11 bg-cta px-5 text-sm font-semibold text-cta-foreground hover:bg-cta/90"
            onClick={() => openForm(null)}
          >
            <Plus aria-hidden="true" />
            Add a vehicle
          </Button>
        </header>
      </Reveal>

      {data && (
        <p aria-live="polite" className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">{total}</span>{' '}
          {total === 1 ? 'vehicle' : 'vehicles'}
        </p>
      )}

      <div
        aria-busy={isFetching || undefined}
        className={cn('transition-opacity', isFetching && !isPending && 'opacity-60')}
      >
        {renderList()}
      </div>

      {data && items.length > 0 && (
        <PaginationBar meta={data.meta} onPageChange={query.setPage} disabled={isFetching} />
      )}

      <VehicleFormDialog
        open={formState.open}
        onOpenChange={(open) => setFormState((current) => ({ ...current, open }))}
        vehicle={formState.vehicle}
      />

      <ConfirmDialog
        open={vehicleToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setVehicleToDelete(null)
        }}
        title={vehicleToDelete ? `Remove ${vehicleToDelete.plateNumber}?` : 'Remove vehicle?'}
        description="Guardians will no longer be able to pick it. A vehicle that has ride records cannot be removed, because those trips point at it."
        confirmLabel="Remove vehicle"
        cancelLabel="Keep vehicle"
        onConfirm={() => {
          if (vehicleToDelete) deleteVehicle.mutate(vehicleToDelete.id)
          setVehicleToDelete(null)
        }}
      />
    </div>
  )
}
