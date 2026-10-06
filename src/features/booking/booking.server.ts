import 'server-only'
import { serverApi } from '@/lib/api/server'
import type { Booking, BookingListParams, WaitlistEntry, WaitlistListParams } from '@/types'

export const getBookingsPage = (params: BookingListParams) =>
  serverApi.getList<Booking>('/booking', params)

export const getWaitlistPage = (params: WaitlistListParams) =>
  serverApi.getList<WaitlistEntry>('/booking/waitlist', params)
