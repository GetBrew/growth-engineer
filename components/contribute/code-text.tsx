import { Fragment } from 'react'

/**
 * Plain text in which `backticks` mark code — a file, a field, a value — set
 * the way the rendered markdown sets inline code, so `workflows/` reads as a
 * folder and not a typo. Only single backticks; nothing else is parsed.
 */
export function CodeText({ text }: { text: string }) {
  return text.split('`').map((part, index) =>
    index % 2 === 1 ? (
      <code
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-foreground"
        // biome-ignore lint/suspicious/noArrayIndexKey: parts of one fixed string
        key={index}
      >
        {part}
      </code>
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: parts of one fixed string
      <Fragment key={index}>{part}</Fragment>
    )
  )
}
