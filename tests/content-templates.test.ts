import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import type { z } from 'zod'
import { getCatalog } from '@/lib/catalog/catalog'
import { ProblemList } from '@/lib/content/errors'
import { splitFrontmatter } from '@/lib/content/frontmatter'
import { parseWorkflowFile } from '@/lib/content/parse-workflow'
import {
  accessSchema,
  companySchema,
  formatIssues,
  toolSchema,
} from '@/lib/schemas/content'
import { REPO_ROOT } from './helpers/source-files'

/**
 * The copy-paste templates in the folder READMEs are the first thing a
 * contributor copies, so every one of them must parse against the schema it
 * documents. A README that drifts from the schema teaches the wrong shape.
 */

const READMES = ['companies/README.md', 'workflows/README.md']

/** Every ```markdown fenced block, with the README it came from. */
function templates(): Array<{ file: string; index: number; source: string }> {
  const fence = /```markdown\n([\s\S]*?)```/g
  return READMES.flatMap((file) => {
    const text = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8')
    return [...text.matchAll(fence)].map((match, index) => ({
      file,
      index,
      source: match[1] ?? '',
    }))
  })
}

type Kind = 'access' | 'workflow' | 'company' | 'tool'

/** Which file kind a template documents, from the header fields it carries. */
function kindOf(data: Record<string, unknown>): Kind {
  if ('type' in data && 'auth' in data) {
    return 'access'
  }
  if ('author' in data) {
    return 'workflow'
  }
  if ('domain' in data) {
    return 'company'
  }
  return 'tool'
}

const SCHEMAS: Record<Exclude<Kind, 'workflow'>, z.ZodType> = {
  access: accessSchema,
  company: companySchema,
  tool: toolSchema,
}

/** The problems a template has, read exactly the way the build reads it. */
function problemsOf(file: string, source: string): Array<string> {
  const kind = kindOf(splitFrontmatter(file, source).data)
  if (kind === 'workflow') {
    // Header AND body: the workflow parser the build uses.
    const problems = new ProblemList()
    try {
      parseWorkflowFile(file, source, problems)
      problems.throwIfAny()
    } catch (error) {
      return [String(error)]
    }
    return []
  }
  const result = SCHEMAS[kind].safeParse(splitFrontmatter(file, source).data)
  return result.success ? [] : [`${kind}: ${formatIssues(result.error)}`]
}

describe('README templates', () => {
  const found = templates()

  test('every folder README carries at least one template', () => {
    const files = new Set(found.map((template) => template.file))
    expect([...files].sort()).toEqual([...READMES].sort())
    expect(found.length).toBeGreaterThanOrEqual(4)
  })

  test.each(found)('$file template #$index parses', ({ file, source }) => {
    expect(problemsOf(file, source)).toEqual([])
  })

  test('the workflow template names tools that are published', () => {
    const tools = getCatalog().tools
    const workflowTemplates = found.filter(
      (template) =>
        kindOf(splitFrontmatter(template.file, template.source).data) ===
        'workflow'
    )
    expect(workflowTemplates.length).toBeGreaterThan(0)
    for (const template of workflowTemplates) {
      const parsed = parseWorkflowFile(
        template.file,
        template.source,
        new ProblemList()
      )
      for (const step of parsed?.data.steps ?? []) {
        expect(tools.has(step.tool), step.tool).toBe(true)
      }
    }
  })

  test('the templates cover every file kind', () => {
    const kinds = new Set(
      found.map((template) =>
        kindOf(splitFrontmatter(template.file, template.source).data)
      )
    )
    expect([...kinds].sort()).toEqual(['access', 'company', 'tool', 'workflow'])
  })
})
