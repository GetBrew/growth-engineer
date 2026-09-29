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
import { MAX_LOGO_BYTES } from '@/lib/content/logos'
import { contentFingerprint, readContentTree } from '@/lib/content/read-tree'
import { png } from './helpers/png'

/**
 * The tree walk itself, on a throwaway directory: what it places, what it
 * skips, and what it rejects with a path. `buildCatalog` never sees a file
 * the walk could not place.
 */

const root = mkdtempSync(path.join(tmpdir(), 'growth-engineer-tree-'))

function write(
  relative: string,
  source: string | Uint8Array = '---\nx: 1\n---\n'
) {
  const file = path.join(root, relative)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, source)
}

function problemsIn(): Array<string> {
  return readContentTree(root).problems.map(
    (problem) => `${problem.file}: ${problem.message}`
  )
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
    write('companies/acme/logo.png', png(128))

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
    expect(tree.pendingLogos.get('acme')).toBe('png')
    expect(tree.fingerprint).toMatch(/^[0-9a-f]{40}$/)
    // A rename or a new logo changes it; nothing else has to be read to know.
    const before = contentFingerprint(root)
    renameSync(
      path.join(root, 'workflows/keep-crm-clean.md'),
      path.join(root, 'workflows/keep-the-crm-clean.md')
    )
    expect(contentFingerprint(root)).not.toBe(before)
    const renamed = contentFingerprint(root)
    rmSync(path.join(root, 'companies/acme/logo.png'))
    write('companies/acme/logo.svg', '<svg/>')
    expect(contentFingerprint(root)).not.toBe(renamed)
    rmSync(path.join(root, 'companies/acme/logo.svg'))
    write('companies/acme/logo.png', png(128))
    renameSync(
      path.join(root, 'workflows/keep-the-crm-clean.md'),
      path.join(root, 'workflows/keep-crm-clean.md')
    )
  })

  test('rejects a logo too heavy to serve as is', () => {
    write(
      'companies/heavy/logo.png',
      Buffer.concat([png(128), Buffer.alloc(MAX_LOGO_BYTES)])
    )
    expect(problemsIn()).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^companies\/heavy\/logo\.png: 33 KB; a logo/),
      ])
    )
    rmSync(path.join(root, 'companies/heavy'), { recursive: true })
  })

  test('checks a waiting logo by the rules the upload applies', () => {
    write('companies/wide/logo.png', png(200, 100))
    expect(problemsIn()).toEqual(
      expect.arrayContaining([
        'companies/wide/logo.png: it is 200×100; a logo is drawn in a square, so make it square',
      ])
    )
    rmSync(path.join(root, 'companies/wide'), { recursive: true })
  })

  test('rejects a second logo file', () => {
    write('companies/acme/logo.svg', '<svg viewBox="0 0 10 10"></svg>')
    expect(problemsIn()).toEqual(
      expect.arrayContaining([
        'companies/acme/logo.svg: a company has one logo: keep this or logo.png',
      ])
    )
    rmSync(path.join(root, 'companies/acme/logo.svg'))
  })

  test('rejects a logo under any other name', () => {
    write('companies/acme/icon.png', png(128))
    expect(problemsIn()).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^companies\/acme\/icon\.png: a company folder holds company\.md, tools\/ and, until a maintainer uploads it, logo\.svg/
        ),
      ])
    )
    rmSync(path.join(root, 'companies/acme/icon.png'))
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
