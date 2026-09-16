#!/usr/bin/env node
/**
 * Two gates on the documentation, both cheap and both about rot.
 *
 *   1. EVERY RELATIVE MARKDOWN LINK RESOLVES. A docs tree whose links 404 is
 *      worse than no docs: people stop trusting it and stop reading it, and
 *      then nobody notices when a real instruction goes stale.
 *
 *   2. AGENTS.md STAYS UNDER ITS LINE CAP. It is the file every coding agent
 *      reads first, it is loaded into every context window, and without a hard
 *      cap it grows into a changelog. The cap forces the choice: one canonical
 *      statement per policy here, detail behind a link.
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const AGENTS_MD_MAX_LINES = 200
const ROOT = process.cwd()
const SKIP_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.next',
  '.vercel',
  'dist',
])

function* markdownFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) {
        continue
      }
      yield* markdownFiles(path.join(dir, entry.name))
    } else if (entry.name.endsWith('.md')) {
      yield path.join(dir, entry.name)
    }
  }
}

const failures = []

for (const file of markdownFiles(ROOT)) {
  const source = fs.readFileSync(file, 'utf8')
  // A destination is EITHER angle-bracket wrapped — `](<app/(app)/page.tsx>)`,
  // which is how a path containing parentheses is written — or a bare run with
  // no whitespace or parens. A naive `\(([^)]+)\)` stops at the first `)` and
  // reports every route-group link in this repo as broken.
  const pattern = /\[[^\]]*\]\(\s*(<[^>]*>|[^()\s]+)/g
  let match = pattern.exec(source)
  while (match !== null) {
    const target = match[1]
    match = pattern.exec(source)
    if (
      !target ||
      target.startsWith('http') ||
      target.startsWith('#') ||
      target.startsWith('mailto:')
    ) {
      continue
    }
    // Strip an anchor and any angle-bracket wrapping (used for paths with
    // parentheses, e.g. route groups).
    const cleaned = target.replace(/^<|>$/g, '').split('#')[0]
    if (!cleaned) {
      continue
    }
    const resolved = path.resolve(path.dirname(file), cleaned)
    if (!fs.existsSync(resolved)) {
      failures.push(`${path.relative(ROOT, file)} → ${target} (no such file)`)
    }
  }
}

const agentsPath = path.join(ROOT, 'AGENTS.md')
if (fs.existsSync(agentsPath)) {
  const lineCount = fs.readFileSync(agentsPath, 'utf8').split('\n').length
  if (lineCount > AGENTS_MD_MAX_LINES) {
    failures.push(
      `AGENTS.md is ${lineCount} lines (cap ${AGENTS_MD_MAX_LINES}). Move detail into docs/ and link to it.`
    )
  }
}

if (failures.length > 0) {
  console.error(
    `\ndocs:check failed\n${failures.map((f) => `  ${f}`).join('\n')}\n`
  )
  process.exit(1)
}
console.log('docs:check passed (links resolve, AGENTS.md within its cap).')
