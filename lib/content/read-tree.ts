import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import type { ContentProblem } from './errors'

/**
 * The source tree on disk, classified by path. THE ONLY MODULE THAT TOUCHES
 * THE FILESYSTEM: everything after this point works on `ContentFile`s, so the
 * build is testable with in-memory fixtures and the pages never read a file.
 *
 *   companies/<handle>/company.md
 *   companies/<handle>/access/<id>.md
 *   companies/<handle>/tools/<slug>.md
 *   workflows/<name>.md              (flat: the author is in the file)
 *   tags/<namespace>/<slug>.md
 *
 * A README.md at the top of each tree documents it and is skipped. Any other
 * file or directory is a mistake, reported with its path.
 */

export type ContentFile =
  | { kind: 'company'; path: string; handle: string; source: string }
  | { kind: 'access'; path: string; handle: string; id: string; source: string }
  | { kind: 'tool'; path: string; handle: string; slug: string; source: string }
  | { kind: 'workflow'; path: string; name: string; source: string }
  | {
      kind: 'tag'
      path: string
      namespace: string
      slug: string
      source: string
    }

export type ContentTree = {
  files: Array<ContentFile>
  /** Problems the walk itself found: files that fit no slot. */
  problems: Array<ContentProblem>
  /** File names under public/logos, for the company schema's logo check. */
  logos: Set<string>
  /** Changes when any content file is added, removed or touched. */
  fingerprint: string
}

const MARKDOWN = /\.md$/

/** One walk's state: the root, what it found, and what it could not place. */
class Walk {
  readonly files: Array<ContentFile> = []
  readonly problems: Array<ContentProblem> = []
  count = 0
  newest = 0
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

  read(relative: string): string {
    const absolute = path.join(this.root, relative)
    this.count += 1
    this.newest = Math.max(this.newest, statSync(absolute).mtimeMs)
    return readFileSync(absolute, 'utf8')
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
    } else if (
      (entry === 'access' || entry === 'tools') &&
      walk.isDirectory(relative)
    ) {
      for (const file of walk.markdownFiles(relative)) {
        walk.files.push(
          entry === 'access'
            ? {
                kind: 'access',
                path: file.relative,
                handle,
                id: file.name,
                source: walk.read(file.relative),
              }
            : {
                kind: 'tool',
                path: file.relative,
                handle,
                slug: file.name,
                source: walk.read(file.relative),
              }
        )
      }
    } else {
      walk.reject(
        relative,
        'a company folder holds company.md, access/ and tools/ only'
      )
    }
  }
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

function walkTags(walk: Walk, namespace: string): void {
  for (const file of walk.markdownFiles(path.join('tags', namespace))) {
    walk.files.push({
      kind: 'tag',
      path: file.relative,
      namespace,
      slug: file.name,
      source: walk.read(file.relative),
    })
  }
}

export function readContentTree(root = process.cwd()): ContentTree {
  const walk = new Walk(root)
  for (const handle of walk.folders(
    'companies',
    'companies/ holds one folder per company'
  )) {
    walkCompany(walk, handle)
  }
  walkWorkflows(walk)
  for (const namespace of walk.folders(
    'tags',
    'tags/ holds one folder per namespace'
  )) {
    walkTags(walk, namespace)
  }
  return {
    files: walk.files,
    problems: walk.problems,
    logos: new Set(walk.entries(path.join('public', 'logos'))),
    fingerprint: `${walk.count}:${walk.newest}`,
  }
}
