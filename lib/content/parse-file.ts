import type { z } from 'zod'
import { formatIssues } from '@/lib/schemas/content'
import { ContentError, type ProblemList } from './errors'
import { splitFrontmatter } from './frontmatter'
import type { ContentFile } from './read-tree'

/** Header + schema, or a recorded problem and null. */
export function parseFile<T>(
  file: ContentFile,
  schema: z.ZodType<T>,
  problems: ProblemList
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
  const result = schema.safeParse(split.data)
  if (!result.success) {
    problems.add(file.path, formatIssues(result.error))
    return null
  }
  return { data: result.data, body: split.body }
}
