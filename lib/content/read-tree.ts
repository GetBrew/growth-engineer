import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import type { ContentProblem } from './errors'

/**
 * The source tree on disk, classified by path. THE ONLY MODULE THAT TOUCHES
 * THE FILESYSTEM: everything after this point works on `ContentFile`s, so the
 * build is testable with in-memory fixtures and the pages never read a file.
 *
 *   companies/<handle>/company.md     (the company and its ways in)
 *   companies/<handle>/logo.<ext>     (optional: svg, png, jpg or webp)
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
  /** Each company's logo, by handle: its extension, like `svg`. */
  logos: Map<string, LogoExtension>
  /** Changes when any content file or logo is added, removed, renamed or edited. */
  fingerprint: string
}

const MARKDOWN = /\.md$/
const LOGO = /^logo\.(svg|png|jpg|webp)$/

export type LogoExtension = 'svg' | 'png' | 'jpg' | 'webp'

/** Where a company's logo sits in the repository. */
function logoPath(handle: string, extension: LogoExtension): string {
  return path.join('companies', handle, `logo.${extension}`)
}

/**
 * Logos are drawn at 16–44px and served as they are (no image optimizer), so
 * a logo over this is a 900px export someone forgot to shrink.
 */
export const MAX_LOGO_BYTES = 32 * 1024

/** One walk's state: the root, what it found, and what it could not place. */
class Walk {
  readonly files: Array<ContentFile> = []
  readonly problems: Array<ContentProblem> = []
  readonly logos = new Map<string, LogoExtension>()
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
    } else if (LOGO.test(entry) && walk.isFile(relative)) {
      walkLogo(walk, handle, relative, entry)
    } else if (entry === 'access') {
      walk.reject(
        relative,
        'ways in live in company.md now, under `mcp:`, `cli:` and `api:` in its header'
      )
    } else {
      walk.reject(
        relative,
        'a company folder holds company.md, tools/ and an optional logo.svg, logo.png, logo.jpg or logo.webp'
      )
    }
  }
}

/** A company's logo: drawn small and served as is, so it stays light. */
function walkLogo(
  walk: Walk,
  handle: string,
  relative: string,
  entry: string
): void {
  const bytes = statSync(path.join(walk.root, relative)).size
  if (bytes > MAX_LOGO_BYTES) {
    walk.reject(
      relative,
      `${Math.ceil(bytes / 1024)} KB; a logo is drawn at 44px and served as is — keep it under ${MAX_LOGO_BYTES / 1024} KB (an SVG, or a PNG at most 128px square)`
    )
    return
  }
  walk.logos.set(handle, entry.slice('logo.'.length) as LogoExtension)
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
  if (walk.isDirectory('tags')) {
    walk.reject(
      'tags',
      `tags live in one file now, ${TAGS_FILE} at the root; move each entry there`
    )
  }
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
    logos: walk.logos,
    fingerprint,
  }
}

/** A logo's bytes, for the route that serves it (app/logos/[file]/route.ts). */
export function readLogo(
  handle: string,
  extension: LogoExtension,
  root = process.cwd()
): Buffer {
  return readFileSync(path.join(root, logoPath(handle, extension)))
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
