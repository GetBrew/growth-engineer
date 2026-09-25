import { describe, expect, test } from 'vitest'
import { getSourceFile } from '@/lib/catalog/catalog'
import { loadSourceExcerpt } from '@/lib/catalog/loaders'
import { sourceExcerpt } from '@/lib/catalog/source-excerpt'
import { GUIDE_STEPS } from '@/lib/constants/guide-steps'
import { GUIDES } from '@/lib/constants/guides'

/**
 * The contribute guides quote the catalog instead of copying it: every file a
 * sample names must exist and hold the section quoted, and every path a
 * listing shows must be a real file — so a guide cannot teach a shape the
 * repository no longer has.
 */

const steps = Object.entries(GUIDE_STEPS).flatMap(([guide, list]) =>
  list.map((step) => ({ guide, step }))
)

describe('contribute guides', () => {
  test('every guide has steps, and every step list has a guide', () => {
    expect(Object.keys(GUIDE_STEPS).sort()).toEqual(
      GUIDES.map((guide) => guide.id).sort()
    )
  })

  test.each(steps)(
    '$guide › $step.key quotes a real file',
    async ({ step }) => {
      const sample = step.sample
      if (!sample) {
        return
      }
      if ('file' in sample) {
        const text = await loadSourceExcerpt(sample.file, sample.excerpt)
        expect(text.trim().length).toBeGreaterThan(0)
        return
      }
      for (const line of sample.code.split('\n')) {
        const path = line.trim()
        if (/^(companies|workflows|tags)\/\S+\.md$/.test(path)) {
          expect(getSourceFile(path), path).toBeDefined()
        }
      }
    }
  )

  test('a missing section fails loudly', () => {
    expect(() =>
      sourceExcerpt('x.md', '---\na: 1\n---\n\n## Steps\n', '## Inputs')
    ).toThrow(/no "## Inputs" section/)
    expect(sourceExcerpt('x.md', '---\na: 1\n---\n\n## Steps\n\n1. x\n')).toBe(
      '---\na: 1\n---\n\n## Steps\n\n1. x'
    )
    expect(
      sourceExcerpt('x.md', '---\na: 1\n---\n\n## A\n\none\n\n## B\n', '## A')
    ).toBe('## A\n\none')
  })
})
