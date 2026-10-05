'use client'

import { ChevronDown, Loader2, LogOut, UserRound } from 'lucide-react'
import Link from 'next/link'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogoutMutation } from '@/features/auth/auth.queries'
import { useSession } from '@/hooks/use-session'
import { getRoleLabel } from '@/lib/auth/role-label'
import { PROFILE_PATH } from './nav-config'

// Avatar button in the top bar. The menu shows who is signed in, a link to their profile (the admin
// has none) and, set apart from the normal links, Log out.
export function UserMenu() {
  const session = useSession()
  const logout = useLogoutMutation()
  const profilePath = PROFILE_PATH[session.role]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-11 gap-2 px-2"
            aria-label={`Account menu for ${session.name}`}
          />
        }
      >
        <UserAvatar name={session.name} photo={session.profilePhoto} size={32} />
        <span className="max-w-32 truncate text-sm font-medium max-sm:hidden">{session.name}</span>
        <ChevronDown aria-hidden="true" className="text-muted-foreground max-sm:hidden" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-2">
            <span className="truncate text-sm font-semibold text-foreground">{session.name}</span>
            <span className="truncate text-xs font-normal">{session.email}</span>
            <span className="mt-1 text-xs font-medium text-primary">{getRoleLabel(session)}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        {profilePath && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href={profilePath} />} className="min-h-10 gap-2 px-2">
              <UserRound aria-hidden="true" />
              Profile
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        {/* Stays open while the request runs, so the pending state is visible. */}
        <DropdownMenuItem
          variant="destructive"
          closeOnClick={false}
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
          className="min-h-10 gap-2 px-2"
        >
          {logout.isPending ? (
            <Loader2 aria-hidden="true" className="animate-spin" />
          ) : (
            <LogOut aria-hidden="true" />
          )}
          {logout.isPending ? 'Logging out…' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
