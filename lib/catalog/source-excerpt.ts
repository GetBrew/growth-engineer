/**
 * The part of a source file a page quotes: the YAML header, or one `## `
 * section of the body with its heading. A quote that cannot be found is an
 * error, not an empty box — the example on a page must be the file itself.
 *
 * PURE MODULE: strings only.
 */

export type Excerpt = 'header' | `## ${string}`

const HEADER = /^---\n[\s\S]*?\n---(?=\n|$)/

export function sourceExcerpt(
  path: string,
  source: string,
  excerpt?: Excerpt
): string {
  const text = source.replace(/\r\n/g, '\n')
  if (excerpt === undefined) {
    return text.trimEnd()
  }
  if (excerpt === 'header') {
    const header = HEADER.exec(text)?.[0]
    if (!header) {
      throw new Error(`${path} has no YAML header to quote`)
    }
    return header
  }
  const lines = text.split('\n')
  const start = lines.findIndex((line) => line.trimEnd() === excerpt)
  if (start === -1) {
    throw new Error(`${path} has no "${excerpt}" section to quote`)
  }
  const next = lines.findIndex(
    (line, index) => index > start && line.startsWith('## ')
  )
  return lines
    .slice(start, next === -1 ? undefined : next)
    .join('\n')
    .trimEnd()
}
