/**
 * The part of a source file a page quotes: the YAML header, or one `## `
 * section of the body with its heading. A quote that cannot be found is an
 * error, not an empty box — the example on a page must be the file itself.
 *
 * PURE MODULE: strings only.
 */

export type Excerpt = 'header' | `## ${string}`

const HEADER = /^---\n[\s\S]*?\n---(?=\n|$)/
/** A line nested under a header field: indented, not blank. */
const NESTED = /^\s+\S/

export function sourceExcerpt(
  path: string,
  source: string,
  excerpt?: Excerpt,
  omit: ReadonlyArray<string> = []
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
    return omitFields(path, header, omit)
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

/**
 * The header without the named top-level fields, each with any indented lines
 * under it. A field that is not there is an error, so the list cannot go stale.
 */
function omitFields(
  path: string,
  header: string,
  omit: ReadonlyArray<string>
): string {
  let lines = header.split('\n')
  for (const field of omit) {
    const start = lines.findIndex((line) => line.startsWith(`${field}:`))
    if (start === -1) {
      throw new Error(`${path} has no "${field}" field to leave out`)
    }
    let end = start + 1
    while (end < lines.length && NESTED.test(lines[end] ?? '')) {
      end += 1
    }
    lines = [...lines.slice(0, start), ...lines.slice(end)]
  }
  return lines.join('\n')
}
