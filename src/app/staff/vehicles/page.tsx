import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { VehiclesView } from '@/features/transport/components/vehicles-view'
import { transportKeys } from '@/features/transport/transport.keys'
import { getMyVehiclesPage } from '@/features/transport/transport.server'
import { parseVehicleViewParams, toMyVehicleListParams } from '@/features/transport/vehicle.params'
import { getSession } from '@/lib/auth/session'
import { makeQueryClient } from '@/lib/query-client'
import { StaffType } from '@/types/enums'

export const metadata: Metadata = { title: 'Vehicles' }

type VehiclesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

// The driver's vehicles. Vehicles belong to drivers, so a sitter (whom the backend would answer
// with a 403) goes back to their tasks.
//
// The page in the URL is fetched here, on the server, and handed to the client view through the
// query cache, so the first paint already has the vehicles.
export default async function StaffVehiclesPage({ searchParams }: VehiclesPageProps) {
  const session = await getSession()
  if (session?.staffType === StaffType.SITTER) redirect('/staff')

  const raw = await searchParams
  const params = toMyVehicleListParams(parseVehicleViewParams({ page: first(raw.page) }))

  const queryClient = makeQueryClient()
  // A failure is not fatal: prefetchQuery swallows it and the client view fetches (and shows its own
  // error state) instead.
  await queryClient.prefetchQuery({
    queryKey: transportKeys.myVehicles(params),
    queryFn: () => getMyVehiclesPage(params),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <VehiclesView />
    </HydrationBoundary>
  )
}
