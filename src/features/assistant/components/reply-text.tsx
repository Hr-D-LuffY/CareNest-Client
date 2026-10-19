import type { ReactNode } from 'react'

// Models like to answer in light markdown (**bold**, "- " bullets, "1." lists). Showing the raw
// asterisks looks broken, but turning the text into HTML would let a model inject markup. So this
// reads only those three patterns and builds React elements from them: everything else, links and
// angle brackets included, stays plain text.

const BULLET = /^\s*[-*•]\s+(.*)$/
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/
const BOLD = /\*\*([^*\n]+)\*\*/g

// "Use **this** room" -> ["Use ", <strong>this</strong>, " room"].
function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(BOLD)) {
    const start = match.index ?? 0
    if (start > last) parts.push(text.slice(last, start))
    parts.push(<strong key={start}>{match[1]}</strong>)
    last = start + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

type Block = { kind: 'text'; lines: string[] } | { kind: 'ul' | 'ol'; items: string[] }

function toBlocks(reply: string): Block[] {
  const blocks: Block[] = []
  for (const line of reply.replace(/\r\n/g, '\n').split('\n')) {
    const bullet = BULLET.exec(line)
    const numbered = bullet ? null : NUMBERED.exec(line)
    const item = bullet?.[1] ?? numbered?.[1]
    const kind = bullet ? 'ul' : numbered ? 'ol' : 'text'
    const previous = blocks.at(-1)

    if (kind === 'text') {
      if (previous?.kind === 'text') previous.lines.push(line)
      else blocks.push({ kind: 'text', lines: [line] })
    } else if (previous?.kind === kind) {
      previous.items.push(item ?? '')
    } else {
      blocks.push({ kind, items: [item ?? ''] })
    }
  }
  return blocks
}

// The assistant's answer as readable text: paragraphs with their line breaks, real lists and bold.
export function ReplyText({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2">
      {toBlocks(text).map((block, index) => {
        // Blocks are built once per reply and never reorder, so the position is their identity.
        const key = `${block.kind}-${index}`
        if (block.kind === 'text') {
          const content = block.lines.join('\n').trim()
          return content ? (
            <p key={key} className="whitespace-pre-wrap">
              {renderInline(content)}
            </p>
          ) : null
        }
        const List = block.kind === 'ul' ? 'ul' : 'ol'
        return (
          <List key={key} className={block.kind === 'ul' ? 'list-disc pl-5' : 'list-decimal pl-5'}>
            {block.items.map((item, itemIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: items are static text and never reorder
              <li key={itemIndex} className="pl-1">
                {renderInline(item)}
              </li>
            ))}
          </List>
        )
      })}
    </div>
  )
}
