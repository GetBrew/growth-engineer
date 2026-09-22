import fs from 'node:fs'
import path from 'node:path'

export const REPO_ROOT = path.resolve(__dirname, '../..')

/**
 * Every `.ts` / `.tsx` file under `dir`, recursively, as `{ relativePath,
 * source }` relative to the repo root.
 *
 * Shared by the guards that are source SCANS rather than type checks
 * (catalog-purity, the reserved-handle walk in keys.test). What they assert — "did
 * someone reach around the pattern" — is not expressible in the type system,
 * so it is expressible here or nowhere.
 */
type ReadOptions = {
  /** Directory names to skip entirely, e.g. `_generated`. */
  skipDirectories?: Array<string>
  /** Leave `*.test.ts` out of the result. */
  skipTests?: boolean
}

export function readSourceFiles(
  dir: string,
  { skipDirectories = [], skipTests = false }: ReadOptions = {}
): Array<{ relativePath: string; source: string }> {
  const absolute = path.join(REPO_ROOT, dir)
  if (!fs.existsSync(absolute)) {
    return []
  }
  return walk(absolute, skipDirectories, skipTests).map((file) => ({
    relativePath: path.relative(REPO_ROOT, file),
    source: fs.readFileSync(file, 'utf8'),
  }))
}

function walk(
  dir: string,
  skipDirectories: Array<string>,
  skipTests: boolean
): Array<string> {
  const found: Array<string> = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const child = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (skipDirectories.includes(entry.name)) {
        continue
      }
      found.push(...walk(child, skipDirectories, skipTests))
    } else if (
      /\.tsx?$/.test(entry.name) &&
      !(skipTests && entry.name.includes('.test.'))
    ) {
      found.push(child)
    }
  }
  return found
}
