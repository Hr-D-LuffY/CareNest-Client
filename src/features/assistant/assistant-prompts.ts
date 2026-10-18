// One-tap starters shown before the first question. They are UI copy, not canned answers: each one
// is sent to the assistant like anything the guardian types, and each is something its read-only
// tools can answer (rooms and seats, the guardian's bookings, waitlist and wallet).
export const SUGGESTED_PROMPTS = [
  { text: 'Which rooms have free seats this week?', topic: 'rooms' },
  { text: 'Do I have any upcoming bookings?', topic: 'bookings' },
  { text: 'Am I on any waitlist?', topic: 'waitlist' },
  { text: "What's my wallet balance?", topic: 'wallet' },
] as const

export type PromptTopic = (typeof SUGGESTED_PROMPTS)[number]['topic']
