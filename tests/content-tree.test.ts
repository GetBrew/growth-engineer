import {
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, describe, expect, test } from 'vitest'
import {
  contentFingerprint,
  MAX_LOGO_BYTES,
  readContentTree,
} from '@/lib/content/read-tree'

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
    write('companies/acme/tools/manage-crm.md')
    write('workflows/README.md')
    write('workflows/keep-crm-clean.md')
    write('tags.yml', 'capability:\n  manage-crm:\n    label: Manage a CRM\n')
    write('public/logos/acme.png', 'png')

    const tree = readContentTree(root)
    expect(tree.problems).toEqual([])
    expect(
      tree.files.map((file) => `${file.kind}:${file.path}`).sort()
    ).toEqual([
      'company:companies/acme/company.md',
      'tags:tags.yml',
      'tool:companies/acme/tools/manage-crm.md',
      'workflow:workflows/keep-crm-clean.md',
    ])
    expect(tree.logos.has('acme.png')).toBe(true)
    expect(tree.fingerprint).toMatch(/^[0-9a-f]{40}$/)
    // A rename or a new logo changes it; nothing else has to be read to know.
    const before = contentFingerprint(root)
    renameSync(
      path.join(root, 'workflows/keep-crm-clean.md'),
      path.join(root, 'workflows/keep-the-crm-clean.md')
    )
    expect(contentFingerprint(root)).not.toBe(before)
    const renamed = contentFingerprint(root)
    write('public/logos/other.png', 'png')
    expect(contentFingerprint(root)).not.toBe(renamed)
    rmSync(path.join(root, 'public/logos/other.png'))
    renameSync(
      path.join(root, 'workflows/keep-the-crm-clean.md'),
      path.join(root, 'workflows/keep-crm-clean.md')
    )
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

  test('rejects a leftover access/ folder: ways in live in company.md now', () => {
    write('companies/acme/access/api.md')
    const problems = readContentTree(root).problems.map(
      (problem) => `${problem.file}: ${problem.message}`
    )
    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^companies\/acme\/access: ways in live in company\.md now/
        ),
      ])
    )
    rmSync(path.join(root, 'companies/acme/access'), { recursive: true })
  })

  test('rejects a leftover tags/ folder: the vocabulary is one file now', () => {
    write('tags/capability/manage-crm.md')
    const problems = readContentTree(root).problems.map(
      (problem) => `${problem.file}: ${problem.message}`
    )
    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^tags: tags live in one file now, tags\.yml/),
      ])
    )
    rmSync(path.join(root, 'tags'), { recursive: true })
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
