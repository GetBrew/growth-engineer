import { parse } from 'yaml'
import { ContentError } from './errors'

/**
 * A source file is a YAML header between `---` fences, then a markdown body.
 * The header is parsed with YAML's CORE schema on purpose: `2026-09-16` stays
 * a string (the zod schema turns it into a date), `yes` stays a string, and
 * nothing is coerced behind a contributor's back.
 */

/** `---`, the header, `---` on its own line; the body is whatever follows. */
const FRONTMATTER = /^---\n([\s\S]*?)^---[ \t]*(?:\n|$)/m

export type ParsedFile = {
  data: Record<string, unknown>
  body: string
  /** The 1-based line of the file the body's first line is on. */
  bodyLine: number
}

export function splitFrontmatter(file: string, source: string): ParsedFile {
  const text = source.replace(/\r\n/g, '\n')
  if (!text.startsWith('---\n')) {
    throw new ContentError(
      file,
      'the file must start with a `---` line: YAML header first, then the markdown body'
    )
  }
  const match = FRONTMATTER.exec(text)
  if (!match) {
    throw new ContentError(file, 'the YAML header has no closing `---` line')
  }
  const rest = text.slice(match[0].length)
  const body = rest.trim()
  const bodyStart = match[0].length + (rest.length - rest.trimStart().length)
  const bodyLine = text.slice(0, bodyStart).split('\n').length

  let data: unknown
  try {
    data = parse(match[1] ?? '', { schema: 'core' })
  } catch (error) {
    // biome-ignore lint/style/useErrorCause: the cause travels in ContentError's options argument
    throw new ContentError(
      file,
      `the YAML header does not parse: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    )
  }
  if (data === null || data === undefined) {
    return { data: {}, body, bodyLine }
  }
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new ContentError(file, 'the YAML header must be a map of fields')
  }
  return { data: data as Record<string, unknown>, body, bodyLine }
}
