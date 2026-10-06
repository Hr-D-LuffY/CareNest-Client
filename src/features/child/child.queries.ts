'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Child, ChildListParams, ChildPayload, Paginated } from '@/types'
import { childApi } from './child.api'
import { childKeys } from './child.keys'

export function useChildrenQuery(params: ChildListParams) {
  return useQuery({
    queryKey: childKeys.list(params),
    queryFn: ({ signal }) => childApi.list(params, signal),
    // Keep showing the old page while the next one loads, so paging does not flash a skeleton.
    placeholderData: keepPreviousData,
  })
}

// Create, update and photo upload handle their own errors (field errors in the form, a message
// above the button), so the global toast is switched off for them.

export function useCreateChild() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ChildPayload) => childApi.create(payload),
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: childKeys.all }),
  })
}

export function useUpdateChild() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ChildPayload }) =>
      childApi.update(id, payload),
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: childKeys.all }),
  })
}

export function useUploadChildPhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      file,
      onProgress,
    }: {
      id: string
      file: File
      onProgress?: (percent: number) => void
    }) => childApi.uploadPhoto(id, file, onProgress),
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: childKeys.all }),
  })
}

// Optimistic: the child leaves every cached list at once, and comes back if the backend refuses
// (409 "Cannot delete a child with active bookings or waitlist entries", shown by the global toast).
export function useDeleteChild() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => childApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: childKeys.lists() })
      const previous = queryClient.getQueriesData<Paginated<Child>>({
        queryKey: childKeys.lists(),
      })
      queryClient.setQueriesData<Paginated<Child>>({ queryKey: childKeys.lists() }, (page) =>
        page
          ? {
              items: page.items.filter((child) => child.id !== id),
              meta: { ...page.meta, total: Math.max(0, page.meta.total - 1) },
            }
          : page,
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      for (const [key, data] of context?.previous ?? []) queryClient.setQueryData(key, data)
    },
    onSuccess: () => toast.success('Child removed.'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: childKeys.all }),
  })
}
