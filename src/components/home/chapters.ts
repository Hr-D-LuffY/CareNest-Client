// The chapters of the story, in order. The page wraps each chapter in an element with this id, and
// the progress bar reads the same list, so the two can never drift apart.
export const CHAPTERS = [
  { id: 'chapter-what', label: 'What it is' },
  { id: 'chapter-get', label: 'What you get' },
  { id: 'chapter-how', label: 'How it works' },
  { id: 'chapter-who', label: 'Who is behind it' },
  { id: 'chapter-know', label: 'Good to know' },
  { id: 'chapter-start', label: 'Your turn' },
] as const

export type ChapterId = (typeof CHAPTERS)[number]['id']
