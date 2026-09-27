import { parse } from 'yaml'
import { DERIVED_TAGS } from '@/lib/catalog/derived-tags'
import { isValidKeyPart, type TagNamespace } from '@/lib/catalog/keys'
import { formatIssues, tagsFileSchema } from '@/lib/schemas/content'
import type { Tag } from '@/lib/types/catalog'
import type { ProblemList } from './errors'
import { type ContentFile, TAGS_FILE } from './read-tree'

/**
 * `tags.yml` → every curated tag, then the derived `has:*`. Namespaces and
 * slugs come out in alphabetical order, so the chips keep a stable order no
 * matter how the file is arranged. Counts start at zero; the relations fill
 * them in (./build-relations.ts).
 */

const CURATED = Object.keys(tagsFileSchema.shape).sort()

function emptyCounts(): Tag['counts'] {
  return { companies: 0, tools: 0, workflows: 0 }
}

/** The file as a map, or null with the reason recorded. */
function readFile(
  file: ContentFile,
  problems: ProblemList
): Record<string, unknown> | null {
  let data: unknown
  try {
    data = parse(file.source, { schema: 'core' })
  } catch (error) {
    problems.add(
      file.path,
      `does not parse: ${error instanceof Error ? error.message : String(error)}`
    )
    return null
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    problems.add(file.path, 'must be a map of namespaces')
    return null
  }
  const namespaces = { ...(data as Record<string, unknown>) }
  for (const namespace of Object.keys(namespaces)) {
    if (CURATED.includes(namespace)) {
      continue
    }
    delete namespaces[namespace]
    problems.add(
      file.path,
      namespace === 'has'
        ? "has:* tags are computed from each tool's ways in, never written here"
        : `"${namespace}" is not a namespace; ${TAGS_FILE} holds ${CURATED.join(', ')}`
    )
  }
  return namespaces
}

export function buildTags(
  files: ReadonlyArray<ContentFile>,
  problems: ProblemList
): Map<string, Tag> {
  const tags = new Map<string, Tag>()
  const file = files.find((entry) => entry.kind === 'tags')
  const data = file ? readFile(file, problems) : null
  if (!file) {
    problems.add(TAGS_FILE, 'the vocabulary file is missing')
  }
  const parsed = data && file ? tagsFileSchema.safeParse(data) : null
  if (parsed && !parsed.success && file) {
    problems.add(file.path, formatIssues(parsed.error))
  }
  const entries = parsed?.success ? parsed.data : null
  for (const namespace of CURATED) {
    const slugs = entries?.[namespace as keyof typeof entries] ?? {}
    for (const slug of Object.keys(slugs).sort()) {
      const entry = slugs[slug]
      if (!(entry && isValidKeyPart(slug))) {
        problems.add(
          TAGS_FILE,
          `${namespace}: "${slug}" is not a valid slug: lowercase letters, digits and hyphens`
        )
        continue
      }
      const key = `${namespace}:${slug}`
      tags.set(key, {
        key,
        namespace: namespace as TagNamespace,
        slug,
        label: entry.label,
        synonyms: entry.synonyms,
        counts: emptyCounts(),
      })
    }
  }
  for (const derived of DERIVED_TAGS) {
    const key = `${derived.namespace}:${derived.slug}`
    tags.set(key, { ...derived, key, counts: emptyCounts() })
  }
  return tags
}
