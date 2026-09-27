import type { z } from 'zod'
import {
  formatIssues,
  WORKFLOW_BODY_SECTIONS,
  type WorkflowFrontmatter,
  workflowBodySchema,
  workflowHeaderSchema,
} from '@/lib/schemas/content'
import { ContentError, type ProblemList } from './errors'
import { splitFrontmatter } from './frontmatter'
import { parseWorkflowBody, type WorkflowBody } from './workflow-body'

/**
 * One workflow source file → its fields: the header through its schema, the
 * body through ./workflow-body.ts and then the same per-entry rules. Every
 * problem is recorded with the line it is on; a file with any problem yields
 * null, so nothing half-read reaches the catalog.
 */

export type ParsedWorkflow = {
  data: WorkflowFrontmatter
  notes?: string
  /** The file line each step starts on, for the cross-file checks. */
  stepLines: ReadonlyArray<number>
}

/** Header fields that no longer exist, and what to do instead. */
const RETIRED_FIELDS: Record<string, string> = {
  version: 'versions are gone and git history is the archive; delete the line',
}

const ENTRY_NAME: Record<keyof typeof WORKFLOW_BODY_SECTIONS, string> = {
  inputs: 'input',
  steps: 'step',
  doneWhen: 'check',
}

/**
 * `steps.2.tool: …` → `step 3: tool: …`, on the line the step starts. An
 * entry the body reader already rejected (its line is `flagged`) is skipped:
 * its empty fields would only repeat that problem.
 */
function recordBodyIssues(
  path: string,
  error: z.ZodError,
  lines: WorkflowBody['lines'],
  flagged: ReadonlySet<number>,
  problems: ProblemList
): void {
  for (const issue of error.issues) {
    const [section, index, ...field] = issue.path
    if (
      typeof section === 'string' &&
      section in ENTRY_NAME &&
      typeof index === 'number'
    ) {
      const key = section as keyof typeof ENTRY_NAME
      const line = lines[key][index]
      if (line !== undefined && flagged.has(line)) {
        continue
      }
      const where = field.length > 0 ? `${field.map(String).join('.')}: ` : ''
      problems.add(
        path,
        `${ENTRY_NAME[key]} ${index + 1}: ${where}${issue.message}`,
        line
      )
    } else {
      problems.add(path, `${String(section)}: ${issue.message}`)
    }
  }
}

export function parseWorkflowFile(
  path: string,
  source: string,
  problems: ProblemList
): ParsedWorkflow | null {
  let split: ReturnType<typeof splitFrontmatter>
  try {
    split = splitFrontmatter(path, source)
  } catch (error) {
    problems.add(
      path,
      error instanceof ContentError ? error.detail : String(error)
    )
    return null
  }
  const before = problems.size

  // The inputs, steps and checks used to be header fields; say where they went.
  const header = { ...split.data }
  for (const [field, section] of Object.entries(WORKFLOW_BODY_SECTIONS)) {
    if (field in header) {
      delete header[field]
      problems.add(
        path,
        `\`${field}\` is not a header field: write it in the body under "${section}" (workflows/README.md)`
      )
    }
  }
  for (const [field, advice] of Object.entries(RETIRED_FIELDS)) {
    if (field in header) {
      delete header[field]
      problems.add(path, `\`${field}\`: ${advice}`)
    }
  }
  const parsedHeader = workflowHeaderSchema.safeParse(header)
  if (!parsedHeader.success) {
    problems.add(path, formatIssues(parsedHeader.error))
  }

  const body = parseWorkflowBody(split.body, split.bodyLine)
  for (const problem of body.problems) {
    problems.add(path, problem.message, problem.line)
  }
  const fields = workflowBodySchema.safeParse({
    inputs: body.body.inputs,
    steps: body.body.steps,
    doneWhen: body.body.doneWhen,
  })
  if (!fields.success) {
    const flagged = new Set(body.problems.map((problem) => problem.line))
    recordBodyIssues(path, fields.error, body.body.lines, flagged, problems)
  }

  if (!(parsedHeader.success && fields.success) || problems.size > before) {
    return null
  }
  return {
    data: { ...parsedHeader.data, ...fields.data },
    ...(body.body.notes ? { notes: body.body.notes } : {}),
    stepLines: body.body.lines.steps,
  }
}
