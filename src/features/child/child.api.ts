import { clientApi } from '@/lib/api/client'
import type { Child, ChildListParams, ChildPayload } from '@/types'

// One function per endpoint, for the browser (through the BFF). The server page uses
// child.server.ts instead.
export const childApi = {
  list: (params: ChildListParams, signal?: AbortSignal) =>
    clientApi.getList<Child>('/child', params, signal),
  create: (payload: ChildPayload) => clientApi.post<Child>('/child', payload),
  update: (id: string, payload: ChildPayload) => clientApi.patch<Child>(`/child/${id}`, payload),
  remove: (id: string) => clientApi.delete(`/child/${id}`),
  uploadPhoto: (id: string, file: File, onProgress?: (percent: number) => void) =>
    clientApi.upload<Child>({ path: `/child/${id}/photo`, field: 'photo', file, onProgress }),
}
