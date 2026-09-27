import type { z } from 'zod'
import { formatIssues } from '@/lib/schemas/content'
import { ContentError, type ProblemList } from './errors'
import { splitFrontmatter } from './frontmatter'
import type { ContentFile } from './read-tree'

/**
 * Header + schema, or a recorded problem and null. `retired` names header
 * fields that no longer exist and says what to write instead, so a file in
 * an old shape hears where its fields went, not just "unknown field".
 */
export function parseFile<T>(
  file: ContentFile,
  schema: z.ZodType<T>,
  problems: ProblemList,
  retired: Readonly<Record<string, string>> = {}
): { data: T; body: string } | null {
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
  let isRetired = false
  for (const [field, advice] of Object.entries(retired)) {
    if (field in header) {
      delete header[field]
      problems.add(file.path, `\`${field}\`: ${advice}`)
      isRetired = true
    }
  }
  const result = schema.safeParse(header)
  if (!result.success) {
    problems.add(file.path, formatIssues(result.error))
    return null
  }
  return isRetired ? null : { data: result.data, body: split.body }
}
