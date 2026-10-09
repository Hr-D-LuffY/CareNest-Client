'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { AdminUserListParams } from '@/types'
import { adminUserApi } from './admin-user.api'
import { adminUserKeys } from './admin-user.keys'

export function useAdminUsersQuery(params: AdminUserListParams) {
  return useQuery({
    queryKey: adminUserKeys.list(params),
    queryFn: ({ signal }) => adminUserApi.list(params, signal),
    // Keep showing the old page while the next one loads, so paging and filtering do not flash a
    // skeleton.
    placeholderData: keepPreviousData,
  })
}
