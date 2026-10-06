import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { Child, ChildListParams } from '@/types'

export const getChildrenPage = (params: ChildListParams) =>
  serverApi.getList<Child>('/child', params)
