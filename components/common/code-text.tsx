import { Fragment } from 'react'

const BOXED = 'type-code-inline rounded bg-muted px-1.5 py-0.5 text-foreground'
const QUIET = 'type-code-inline'

export function CodeText({
  text,
  isQuiet = false,
}: {
  text: string
  isQuiet?: boolean
}) {
  return text.split('`').map((part, index) =>
    index % 2 === 1 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: parts of one fixed string
      <code className={isQuiet ? QUIET : BOXED} key={index}>
        {part}
      </code>
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: parts of one fixed string
      <Fragment key={index}>{part}</Fragment>
    )
  )
}
