'use client'

import { upcomingSessions } from '@/features/room/room.params'
import { useRoomQuery } from '@/features/room/room.queries'

// The room the guardian picked, with the seats for the session date they picked. The backend counts
// seats per date, and answers for the room's next session when no date is given, so there are two
// lookups: the next session (which also tells us which dates the room offers) and, when another
// date is picked, that date.
export function useSelectedRoom(roomId: string, sessionDate: string) {
  const next = useRoomQuery(roomId, undefined)
  const nextSession = next.data?.sessionDate

  const otherDate = sessionDate !== '' && nextSession !== undefined && sessionDate !== nextSession
  const dated = useRoomQuery(roomId, sessionDate, otherDate)

  return {
    // Seats for the picked date; the next session's seats while no date is picked.
    room: otherDate ? dated.data : next.data,
    // Dates the room offers: its next sessions, plus the picked one if it is further out.
    sessions: nextSession ? upcomingSessions(nextSession, sessionDate || undefined) : [],
    isPending: roomId !== '' && (next.isPending || (otherDate && dated.isPending)),
    isError: next.isError || (otherDate && dated.isError),
    refetch: () => {
      next.refetch()
      if (otherDate) dated.refetch()
    },
  }
}

export type SelectedRoom = ReturnType<typeof useSelectedRoom>
