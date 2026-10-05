'use client'

import { Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

// Bell in the top bar, before the user menu. The backend has no notifications endpoint yet (see
// ⚠ A17 in AGENTS.md), so it shows an honest empty state: no badge and no invented items. When the
// endpoint exists, the unread count goes on the button and the list replaces the empty state.
export function NotificationMenu() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-11"
            aria-label="Notifications, none yet"
          />
        }
      >
        <Bell aria-hidden="true" className="size-5" />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(20rem,calc(100vw-2rem))] gap-0 p-0">
        <PopoverHeader className="border-b px-4 py-3">
          <PopoverTitle className="text-sm font-semibold">Notifications</PopoverTitle>
        </PopoverHeader>
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BellOff aria-hidden="true" className="size-5" />
          </span>
          <p className="text-sm font-medium">No notifications yet</p>
          <PopoverDescription className="text-sm">
            Updates about your bookings, waitlist and payments will show up here.
          </PopoverDescription>
        </div>
      </PopoverContent>
    </Popover>
  )
}
