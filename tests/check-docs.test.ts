import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const script = path.resolve('scripts/check-docs.mjs')

function check(source: string) {
  const root = mkdtempSync(path.join(tmpdir(), 'growth-docs-'))
  try {
    writeFileSync(path.join(root, 'AGENTS.md'), source)
    return spawnSync(process.execPath, [script], {
      cwd: root,
      encoding: 'utf8',
    })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

describe('root guidance budget', () => {
  it('accepts concise guidance', () => {
    expect(check('# Guidelines\n').status).toBe(0)
  })
  it('rejects excessive bytes even on one line', () => {
    const result = check('é'.repeat(5000))
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('8 KiB')
  })
  it('preserves the existing line budget', () => {
    expect(check('x\n'.repeat(201)).status).toBe(1)
  })
})
