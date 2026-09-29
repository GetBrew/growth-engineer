import { Fragment } from 'react'

const BOXED =
  'rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-foreground'
const QUIET = 'font-mono text-[0.875em]'

/**
 * Plain text in which `backticks` mark code — a file, a field, a value — set
 * the way the rendered markdown sets inline code, so `workflows/` reads as a
 * folder and not a typo. Only single backticks; nothing else is parsed.
 * `isQuiet` sets code in the text's own colour, without a box, for prose
 * where code is frequent and secondary, like a workflow's step.
 */
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
