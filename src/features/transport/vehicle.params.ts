import { DEFAULT_PAGE } from '@/lib/constants'
import type { VehicleListParams } from '@/types'

// Vehicles shown per page on the driver's vehicles page.
export const MY_VEHICLES_PAGE_SIZE = 12

// What the page shows, read from the URL (?page=).
export type VehicleViewParams = { page: number }

// The view's params from the raw URL value. A hand-edited URL (?page=abc) falls back to page 1
// instead of reaching the backend as a 400. Both the server page (prefetch) and the client list call
// this, so they build the same query key.
export function parseVehicleViewParams(raw: { page?: string | null }): VehicleViewParams {
  const page = Number(raw.page)
  return { page: Number.isInteger(page) && page >= DEFAULT_PAGE ? page : DEFAULT_PAGE }
}

export function toMyVehicleListParams({ page }: VehicleViewParams): VehicleListParams {
  return { page, limit: MY_VEHICLES_PAGE_SIZE }
}
