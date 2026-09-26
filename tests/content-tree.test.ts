import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, describe, expect, test } from 'vitest'
import { MAX_LOGO_BYTES, readContentTree } from '@/lib/content/read-tree'

/**
 * The tree walk itself, on a throwaway directory: what it places, what it
 * skips, and what it rejects with a path. `buildCatalog` never sees a file
 * the walk could not place.
 */

const root = mkdtempSync(path.join(tmpdir(), 'growth-engineer-tree-'))

function write(relative: string, source = '---\nx: 1\n---\n') {
  const file = path.join(root, relative)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, source)
}

afterAll(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('the content tree walk', () => {
  test('places every file kind and skips the folder READMEs', () => {
    write('companies/README.md')
    write('companies/acme/company.md')
    write('companies/acme/access/api.md')
    write('companies/acme/tools/manage-crm.md')
    write('workflows/README.md')
    write('workflows/keep-crm-clean.md')
    write('tags/README.md')
    write('tags/capability/manage-crm.md')
    write('public/logos/acme.png', 'png')

    const tree = readContentTree(root)
    expect(tree.problems).toEqual([])
    expect(
      tree.files.map((file) => `${file.kind}:${file.path}`).sort()
    ).toEqual([
      'access:companies/acme/access/api.md',
      'company:companies/acme/company.md',
      'tag:tags/capability/manage-crm.md',
      'tool:companies/acme/tools/manage-crm.md',
      'workflow:workflows/keep-crm-clean.md',
    ])
    expect(tree.logos.has('acme.png')).toBe(true)
    expect(tree.fingerprint).toMatch(/^\d+:\d+(\.\d+)?$/)
  })

  test('rejects a logo too heavy to serve as is', () => {
    write('public/logos/huge.png', 'x'.repeat(MAX_LOGO_BYTES + 1))
    const problems = readContentTree(root).problems.map(
      (problem) => `${problem.file}: ${problem.message}`
    )
    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^public\/logos\/huge\.png: 33 KB; a logo/),
      ])
    )
    rmSync(path.join(root, 'public/logos/huge.png'))
  })

  test('rejects a nested workflow folder, a stray file and a misplaced folder', () => {
    write('workflows/jdoe/nested.md')
    write('workflows/notes.txt', 'plain')
    write('companies/acme/notes/todo.md')
    write('companies/loose.md')

    const problems = readContentTree(root).problems.map(
      (problem) => `${problem.file}: ${problem.message}`
    )
    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^workflows\/jdoe: a workflow is one file, workflows\/<name>\.md — no folders/
        ),
        expect.stringMatching(
          /^workflows\/notes\.txt: only \.md files belong here/
        ),
        expect.stringMatching(
          /^companies\/acme\/notes: a company folder holds/
        ),
        expect.stringMatching(
          /^companies\/loose\.md: companies\/ holds one folder per company/
        ),
      ])
    )
  })
})
