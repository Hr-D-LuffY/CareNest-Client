'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type UserAvatarProps = {
  name: string
  photo: string | null | undefined
  // Pixel size of the circle. The photo is requested at this size, not larger.
  size?: number
  className?: string
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}

// The profile photo, or the person's initials when there is none (or it fails to load). Never a
// placeholder image. The name is decorative where it already appears as text next to the avatar.
export function UserAvatar({ name, photo, size = 32, className }: UserAvatarProps) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null)
  const showPhoto = Boolean(photo) && failedPhoto !== photo

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-secondary-foreground ring-1 ring-border select-none',
        className,
      )}
    >
      {showPhoto && photo ? (
        <Image
          src={photo}
          alt=""
          width={size}
          height={size}
          className="size-full object-cover"
          onError={() => setFailedPhoto(photo)}
        />
      ) : (
        getInitials(name)
      )}
    </span>
  )
}
