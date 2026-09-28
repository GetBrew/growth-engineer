import type { z } from 'zod'
import { formatIssues } from '@/lib/schemas/content'
import { ContentError, type ProblemList } from './errors'
import { splitFrontmatter } from './frontmatter'
import type { ContentFile } from './read-tree'

/**
 * Header + schema, or a recorded problem and null. `misplaced` names header
 * fields a source file must not write and says what to write instead, so a
 * file copied from the wrong shape hears why, not just "unknown field".
 */
export function parseFile<T>(
  file: ContentFile,
  schema: z.ZodType<T>,
  problems: ProblemList,
  misplaced: Readonly<Record<string, string>> = {}
): { data: T; body: string; bodyLine: number } | null {
  let split: ReturnType<typeof splitFrontmatter>
  try {
    split = splitFrontmatter(file.path, file.source)
  } catch (error) {
    problems.add(
      file.path,
      error instanceof ContentError ? error.detail : String(error)
    )
    return null
  }
  const header = { ...split.data }
  let isMisplaced = false
  for (const [field, advice] of Object.entries(misplaced)) {
    if (field in header) {
      delete header[field]
      problems.add(file.path, `\`${field}\` ${advice}`)
      isMisplaced = true
    }
  }
  const result = schema.safeParse(header)
  if (!result.success) {
    problems.add(file.path, formatIssues(result.error))
    return null
  }
  return isMisplaced
    ? null
    : { data: result.data, body: split.body, bodyLine: split.bodyLine }
}
