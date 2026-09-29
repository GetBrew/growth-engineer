import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import type { ContentProblem } from './errors'
import { LOGO_FILE, type LogoExtension, logoProblems } from './logos'

/**
 * The source tree on disk, classified by path. THE ONLY MODULE THAT TOUCHES
 * THE FILESYSTEM: everything after this point works on `ContentFile`s, so the
 * build is testable with in-memory fixtures and the pages never read a file.
 *
 *   companies/<handle>/company.md     (the company and its ways in)
 *   companies/<handle>/logo.<ext>     (a logo waiting for a maintainer to
 *                                      move it to the CDN: lib/content/logos.ts)
 *   companies/<handle>/tools/<name>.md
 *   workflows/<name>.md              (flat: the author is in the file)
 *   tags.yml                         (the whole vocabulary, one file)
 *
 * A README.md at the top of each tree documents it and is skipped. Any other
 * file or directory is a mistake, reported with its path.
 */

export type ContentFile =
  | { kind: 'company'; path: string; handle: string; source: string }
  | { kind: 'tool'; path: string; handle: string; slug: string; source: string }
  | { kind: 'workflow'; path: string; name: string; source: string }
  | { kind: 'tags'; path: string; source: string }

/** The vocabulary: every tag, one file at the root. */
export const TAGS_FILE = 'tags.yml'

export type ContentTree = {
  files: Array<ContentFile>
  /** Problems the walk itself found: files that fit no slot. */
  problems: Array<ContentProblem>
  /** Logo files waiting to be uploaded, by handle: the extension, like `svg`. */
  pendingLogos: Map<string, LogoExtension>
  /** Changes when any content file or logo is added, removed, renamed or edited. */
  fingerprint: string
}

const MARKDOWN = /\.md$/

/** One walk's state: the root, what it found, and what it could not place. */
class Walk {
  readonly files: Array<ContentFile> = []
  readonly problems: Array<ContentProblem> = []
  readonly pendingLogos = new Map<string, LogoExtension>()
  readonly root: string

  constructor(root: string) {
    this.root = root
  }

  entries(relative: string): Array<string> {
    try {
      return readdirSync(path.join(this.root, relative))
        .filter((name) => !name.startsWith('.'))
        .sort()
    } catch {
      return []
    }
  }

  isDirectory(relative: string): boolean {
    try {
      return statSync(path.join(this.root, relative)).isDirectory()
    } catch {
      return false
    }
  }

  isFile(relative: string): boolean {
    try {
      return statSync(path.join(this.root, relative)).isFile()
    } catch {
      return false
    }
  }

  read(relative: string): string {
    return readFileSync(path.join(this.root, relative), 'utf8')
  }

  reject(file: string, message: string): void {
    this.problems.push({ file, message })
  }

  /** The folders directly under a tree, skipping its README; files are rejected. */
  folders(tree: string, expectation: string): Array<string> {
    return this.entries(tree).filter((name) => {
      const relative = path.join(tree, name)
      if (this.isDirectory(relative)) {
        return true
      }
      if (name !== 'README.md') {
        this.reject(relative, expectation)
      }
      return false
    })
  }

  /** The .md files directly under a folder; anything else is rejected. */
  markdownFiles(folder: string): Array<{ relative: string; name: string }> {
    return this.entries(folder).flatMap((entry) => {
      const relative = path.join(folder, entry)
      if (MARKDOWN.test(entry) && !this.isDirectory(relative)) {
        return [{ relative, name: entry.replace(MARKDOWN, '') }]
      }
      this.reject(relative, 'only .md files belong here')
      return []
    })
  }
}

function walkCompany(walk: Walk, handle: string): void {
  const companyDir = path.join('companies', handle)
  for (const entry of walk.entries(companyDir)) {
    const relative = path.join(companyDir, entry)
    if (entry === 'company.md') {
      walk.files.push({
        kind: 'company',
        path: relative,
        handle,
        source: walk.read(relative),
      })
    } else if (entry === 'tools' && walk.isDirectory(relative)) {
      for (const file of walk.markdownFiles(relative)) {
        walk.files.push({
          kind: 'tool',
          path: file.relative,
          handle,
          slug: file.name,
          source: walk.read(file.relative),
        })
      }
    } else if (LOGO_FILE.test(entry) && walk.isFile(relative)) {
      walkLogo(walk, handle, relative, entry)
    } else {
      walk.reject(
        relative,
        'a company folder holds company.md, tools/ and, until a maintainer uploads it, logo.svg, logo.png, logo.jpg or logo.webp'
      )
    }
  }
}

/**
 * A logo a contributor added, checked by the rules the upload applies, so a
 * pull request hears about a bad file before a maintainer does.
 */
function walkLogo(
  walk: Walk,
  handle: string,
  relative: string,
  entry: string
): void {
  const extension = entry.slice('logo.'.length) as LogoExtension
  const other = walk.pendingLogos.get(handle)
  if (other) {
    walk.reject(relative, `a company has one logo: keep this or logo.${other}`)
    return
  }
  const bytes = readFileSync(path.join(walk.root, relative))
  for (const problem of logoProblems(bytes, extension)) {
    walk.reject(relative, problem)
  }
  // A bad file still counts as the company's logo: its problems are enough.
  walk.pendingLogos.set(handle, extension)
}

/** workflows/ is FLAT: one .md per workflow, its author in the header. */
function walkWorkflows(walk: Walk): void {
  for (const entry of walk.entries('workflows')) {
    const relative = path.join('workflows', entry)
    if (entry === 'README.md') {
      continue
    }
    if (walk.isDirectory(relative)) {
      walk.reject(
        relative,
        'a workflow is one file, workflows/<name>.md — no folders; the author goes in the header'
      )
      continue
    }
    if (!MARKDOWN.test(entry)) {
      walk.reject(relative, 'only .md files belong here')
      continue
    }
    walk.files.push({
      kind: 'workflow',
      path: relative,
      name: entry.replace(MARKDOWN, ''),
      source: walk.read(relative),
    })
  }
}

export function readContentTree(root = process.cwd()): ContentTree {
  // Taken BEFORE reading: a file saved mid-read then differs from this
  // fingerprint, so the next request reads the tree again.
  const fingerprint = contentFingerprint(root)
  const walk = new Walk(root)
  for (const handle of walk.folders(
    'companies',
    'companies/ holds one folder per company'
  )) {
    walkCompany(walk, handle)
  }
  walkWorkflows(walk)
  if (walk.isFile(TAGS_FILE)) {
    walk.files.push({
      kind: 'tags',
      path: TAGS_FILE,
      source: walk.read(TAGS_FILE),
    })
  }
  return {
    files: walk.files,
    problems: walk.problems,
    pendingLogos: walk.pendingLogos,
    fingerprint,
  }
}

/** Every path under a directory, recursively, with its size and mtime. */
function statEntries(root: string, relative: string): Array<string> {
  let names: Array<string>
  try {
    names = readdirSync(path.join(root, relative))
  } catch {
    return []
  }
  return names.flatMap((name) => {
    const child = path.join(relative, name)
    const stats = statSync(path.join(root, child))
    return stats.isDirectory()
      ? statEntries(root, child)
      : [`${child}:${stats.size}:${stats.mtimeMs}`]
  })
}

/** One file's entry, or none when it is missing. */
function statFile(root: string, relative: string): Array<string> {
  try {
    const stats = statSync(path.join(root, relative))
    return [`${relative}:${stats.size}:${stats.mtimeMs}`]
  } catch {
    return []
  }
}

/**
 * A cheap answer to "did the tree change?" for the development server: the
 * sorted paths of every content file and logo with their size and mtime,
 * hashed. `stat` only — no file is read — so a rename, a new logo or an edit
 * all change it, and an unchanged tree costs no parsing at all.
 */
export function contentFingerprint(root = process.cwd()): string {
  const entries = [
    ...statEntries(root, 'companies'),
    ...statEntries(root, 'workflows'),
    ...statFile(root, TAGS_FILE),
  ].sort()
  return createHash('sha1').update(entries.join('\n')).digest('hex')
}
