import type { AssistantRoom, ChatLink } from '@/types'

// The backend builds every booking link from a room its own search returned, and sends them beside
// the rooms ("/dashboard/book?room=&date=&child="). These helpers only read them. The reply text
// is never searched for links: whatever a model writes there is shown as plain text.

// Links stay inside the guardian's area. Anything else the backend might one day send (another
// site, a protocol-relative "//host" URL) is not rendered as a link.
export function isGuardianPath(href: string): boolean {
  return href.startsWith('/dashboard/')
}

// The room a booking link is for: the `room` in its query string.
function roomIdOf(link: ChatLink): string | null {
  const query = link.href.split('?')[1]
  return query ? new URLSearchParams(query).get('room') : null
}

export function findBookingLink(links: readonly ChatLink[], room: AssistantRoom): ChatLink | null {
  return links.find((link) => isGuardianPath(link.href) && roomIdOf(link) === room.id) ?? null
}

// Links that belong to none of the cards (not expected, but never silently dropped).
export function findOtherLinks(
  links: readonly ChatLink[],
  rooms: readonly AssistantRoom[],
): ChatLink[] {
  const roomIds = new Set(rooms.map((room) => room.id))
  return links.filter((link) => {
    const roomId = roomIdOf(link)
    return isGuardianPath(link.href) && (roomId === null || !roomIds.has(roomId))
  })
}

// A room's own page, for the card's "View room" link.
export function roomPagePath(room: AssistantRoom): string {
  return `/dashboard/rooms/${room.id}`
}
