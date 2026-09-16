import fs from 'node:fs'
import path from 'node:path'

function loadDotEnvFile({ filename }: { filename: string }) {
  const filePath = path.resolve(process.cwd(), filename)
  if (!fs.existsSync(filePath)) {
    return
  }

  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }
    const separatorIndex = line.indexOf('=')
    if (separatorIndex <= 0) {
      continue
    }
    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    if (!key || process.env[key] !== undefined) {
      continue
    }
    process.env[key] = value.replace(/^['"]|['"]$/g, '')
  }
}

/**
 * Order matters: the FIRST file to define a key wins, because
 * `loadDotEnvFile` skips any key already present in `process.env`.
 *
 *   1. the real environment (CI secrets, an exported shell var) — always wins
 *   2. `.env.test.local` — gitignored, credentials specific to testing
 *   3. `.env.local`      — gitignored, your real app credentials
 *   4. `.env.test`       — COMMITTED, non-secret placeholders
 *
 * Step 4 is what makes a fresh clone hermetic: `pnpm test:run` is green with
 * no credentials at all, so CI runners, cloud agents and new worktrees need no
 * setup. Add a variable there only when a test fails without it.
 *
 * Step 3 must stay ABOVE step 4. Setup files run before any test module and a
 * placeholder seeded here is permanent for the process — with `.env.test`
 * seeding a key first, an opt-in live suite would read the placeholder, treat
 * it as "no credential", skip, and report green while running nothing on a
 * machine that had a perfectly good secret in `.env.local`.
 */
loadDotEnvFile({ filename: '.env.test.local' })
loadDotEnvFile({ filename: '.env.local' })
loadDotEnvFile({ filename: '.env.test' })
