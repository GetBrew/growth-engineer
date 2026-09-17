/**
 * The CLI is normally reached through a symlink in ~/.claude/skills, and its
 * entry-point check compares import.meta.url (always RESOLVED) against
 * process.argv[1]. Forget to realpath argv[1] and main() never runs: no
 * output, exit code 0, success by every signal a caller can see.
 *
 *   node --test .agents/skills/upload-to-growth-cdn/scripts/cli.test.mjs
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, test } from 'node:test'
import { fileURLToPath } from 'node:url'

const scriptsDir = dirname(fileURLToPath(import.meta.url))
const work = mkdtempSync(join(tmpdir(), 'upload-to-growth-cdn-'))
const probe = join(work, 'probe.png')
writeFileSync(probe, 'hi')

after(() => rmSync(work, { recursive: true, force: true }))

function runDryRun(entry) {
  return spawnSync(process.execPath, [entry, probe, '--dry-run'], { encoding: 'utf8' })
}

test('the CLI produces output when run directly', () => {
  const result = runDryRun(join(scriptsDir, 'upload.mjs'))
  assert.equal(result.status, 0)
  assert.match(result.stdout, /^dry-run\s/m)
  assert.match(result.stdout, /cdn: https:\/\/cdn\.growth\.engineer\/assets\//)
})

test('the CLI produces output THROUGH A SYMLINK, not a silent exit 0', () => {
  const link = join(work, 'linked-scripts')
  symlinkSync(scriptsDir, link)
  const result = runDryRun(join(link, 'upload.mjs'))
  assert.equal(result.status, 0)
  assert.notEqual(result.stdout.trim(), '', 'symlinked CLI printed nothing — entry-point check is not resolving argv[1]')
  assert.match(result.stdout, /cdn: https:\/\/cdn\.growth\.engineer\/assets\//)
})

test('a refusal still exits non-zero through a symlink', () => {
  const link = join(work, 'linked-scripts-2')
  symlinkSync(scriptsDir, link)
  const secret = join(work, '.env.local')
  writeFileSync(secret, 'x')
  const result = spawnSync(process.execPath, [join(link, 'upload.mjs'), secret, '--dry-run'], { encoding: 'utf8' })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /looks like a credential/)
})
