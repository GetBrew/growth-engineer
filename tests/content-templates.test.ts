import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { splitFrontmatter } from '@/lib/content/frontmatter'
import {
  accessSchema,
  companySchema,
  formatIssues,
  tagSchema,
  toolSchema,
  workflowSchema,
} from '@/lib/content/schemas'
import { REPO_ROOT } from './helpers/source-files'

/**
 * The copy-paste templates in the folder READMEs are the first thing a
 * contributor copies, so every one of them must parse against the schema it
 * documents. A README that drifts from the schema teaches the wrong shape.
 */

const READMES = ['companies/README.md', 'workflows/README.md', 'tags/README.md']

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

/** Which file kind a template documents, from the fields it carries. */
function schemaFor(data: Record<string, unknown>) {
  if ('type' in data && 'auth' in data) {
    return { kind: 'access', schema: accessSchema }
  }
  if ('steps' in data) {
    return { kind: 'workflow', schema: workflowSchema }
  }
  if ('domain' in data) {
    return { kind: 'company', schema: companySchema }
  }
  if ('summary' in data) {
    return { kind: 'tool', schema: toolSchema }
  }
  return { kind: 'tag', schema: tagSchema }
}

describe('README templates', () => {
  const found = templates()

  test('every folder README carries at least one template', () => {
    const files = new Set(found.map((template) => template.file))
    expect([...files].sort()).toEqual([...READMES].sort())
    expect(found.length).toBeGreaterThanOrEqual(5)
  })

  test.each(found)('$file template #$index parses', ({ file, source }) => {
    const parsed = splitFrontmatter(file, source)
    const { kind, schema } = schemaFor(parsed.data)
    const result = schema.safeParse(parsed.data)
    expect(
      result.success,
      result.success ? kind : `${kind}: ${formatIssues(result.error)}`
    ).toBe(true)
  })

  test('the templates cover every file kind', () => {
    const kinds = new Set(
      found.map(
        (template) =>
          schemaFor(splitFrontmatter(template.file, template.source).data).kind
      )
    )
    expect([...kinds].sort()).toEqual([
      'access',
      'company',
      'tag',
      'tool',
      'workflow',
    ])
  })
})
