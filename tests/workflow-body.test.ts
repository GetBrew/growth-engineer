import { describe, expect, test } from 'vitest'
import { parseWorkflowBody, toolSourceLink } from '@/lib/content/workflow-body'

/**
 * The workflow body reader on its own: what it accepts beyond the one shape
 * the content fixtures use, and the line every problem is reported on. The
 * build-level rules (tools resolve, ten steps at most) are in
 * content-schema.test.ts.
 */

const LINK = '[acme/manage-crm](../companies/acme/tools/manage-crm.md)'

function read(lines: ReadonlyArray<string>, firstLine = 1) {
  return parseWorkflowBody(lines.join('\n'), firstLine)
}

describe('workflow body', () => {
  test('reads the outcome, inputs, steps and notes', () => {
    const { body, problems } = read([
      '## Outcome',
      '',
      '- No duplicates remain.',
      '',
      '## Inputs',
      '',
      '- `region`: where to look, e.g. EMEA',
      '- `owner`: who gets the list',
      '',
      '## Steps',
      '',
      `1. **Dedupe** with ${LINK}. Merge duplicates.`,
      `2. **Tell the owner** with ${LINK}. Send \`owner\` the list.`,
      '',
      '## Notes',
      '',
      'Run it weekly.',
    ])
    expect(problems).toEqual([])
    expect(body.inputs).toEqual([
      { name: 'region', description: 'where to look', example: 'EMEA' },
      { name: 'owner', description: 'who gets the list' },
    ])
    expect(body.steps).toEqual([
      {
        title: 'Dedupe',
        tool: 'acme/manage-crm',
        instruction: 'Merge duplicates.',
      },
      {
        title: 'Tell the owner',
        tool: 'acme/manage-crm',
        instruction: 'Send `owner` the list.',
      },
    ])
    expect(body.outcome).toEqual(['No duplicates remain.'])
    expect(body.notes).toBe('Run it weekly.')
    expect(body.lines).toEqual({
      outcome: [3],
      inputs: [7, 8],
      steps: [12, 13],
    })
  })

  test('joins a wrapped item and counts lines from the file', () => {
    const { body, problems } = read(
      [
        '## Outcome',
        '',
        '* Clean.',
        '',
        '## Steps',
        '',
        `1. **Dedupe** with ${LINK}. Merge`,
        '   duplicates by email.',
      ],
      9
    )
    expect(problems).toEqual([])
    expect(body.steps[0]?.instruction).toBe('Merge duplicates by email.')
    expect(body.lines.outcome).toEqual([11])
    expect(body.lines.steps).toEqual([15])
  })

  test('accepts headings in any case and `1)` markers', () => {
    const { body, problems } = read([
      '## OUTCOME',
      '- Clean.',
      '## steps',
      `1) **Dedupe** with ${LINK}. Merge duplicates.`,
    ])
    expect(problems).toEqual([])
    expect(body.steps).toHaveLength(1)
  })

  test('keeps notes verbatim, headings and code included', () => {
    const notes = ['### Why weekly', '', '```bash', '## not a section', '```']
    const { body, problems } = read([
      '## Outcome',
      '- Clean.',
      '## Steps',
      `1. **Dedupe** with ${LINK}. Merge duplicates.`,
      '## Notes',
      '',
      ...notes,
    ])
    expect(problems).toEqual([])
    expect(body.notes).toBe(notes.join('\n'))
  })

  test('names the line of every problem', () => {
    const { problems } = read([
      '# Keep the CRM clean',
      '## Steps',
      `1. **Dedupe** with ${LINK}. Merge duplicates.`,
      '   - and nothing nested',
      '',
      '   A second paragraph.',
      '## Steps',
      '## Afterwards',
    ])
    expect(problems.map((problem) => problem.line)).toEqual([1, 4, 6, 7, 8])
    expect(problems[0]?.message).toMatch(/title belongs in the header/)
    expect(problems[1]?.message).toMatch(/no nested lists/)
    expect(problems[2]?.message).toMatch(/one paragraph per item/)
    expect(problems[3]?.message).toMatch(/a second "## Steps"/)
    expect(problems[4]?.message).toMatch(/is not a section/)
  })

  test('a link to a tool is its source file, relative to workflows/', () => {
    expect(toolSourceLink('clay/enrich-contacts')).toBe(
      '../companies/clay/tools/enrich-contacts.md'
    )
  })
})
