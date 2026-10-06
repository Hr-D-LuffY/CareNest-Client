'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { staffApi } from './staff.api'
import { staffKeys } from './staff.keys'
import type { StaffRatingsParams } from './staff.params'

export function useStaffRatingsQuery(staffId: string, params: StaffRatingsParams) {
  return useQuery({
    queryKey: staffKeys.ratings(staffId, params),
    queryFn: ({ signal }) => staffApi.ratings(staffId, params, signal),
    // Keep showing the old page of reviews while the next one loads.
    placeholderData: keepPreviousData,
  })
}
