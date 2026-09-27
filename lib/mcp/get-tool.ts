import { z } from 'zod'
import { TAG_NAMESPACE_MEANINGS } from '@/lib/catalog/definitions'
import {
  ENTITY_TYPES,
  type EntityType,
  filePathToRef,
  formatRef,
  parseRef,
  refToFilePath,
  TAG_NAMESPACES,
  type TagNamespace,
} from '@/lib/catalog/keys'
import { relationsOf } from '@/lib/catalog/relations'
import type { Catalog } from '@/lib/content/build-catalog'
import { mcpEntries } from './entries'
import { closest } from './suggest'
import { type ToolResult, toolError } from './tool-result'

/**
 * MCP `get`: one entry, whole. A company, tool or workflow returns its file —
 * byte for byte what its `.md` URL serves — plus its links as refs, so an
 * agent can walk the catalog: a workflow's tools, a tool's company and the
 * workflows using it. A TAG (`capability:enrich-contacts`) returns everything
 * carrying it: every vendor's version of one job, side by side.
 *
 * Takes a ref, a tag key, or a page or `.md` URL; follows renamed keys; a
 * miss suggests the closest refs. Drafts are never found.
 */

export const getArgs = z.strictObject({
  ref: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .describe(
      'A ref from search (`tool:clay/enrich-contacts`, `workflow:funding-signal-outbound`, `company:clay`), a tag (`capability:enrich-contacts`), or a page or .md URL.'
    ),
})

export const getOutput = z.strictObject({
  ref: z.string(),
  type: z.enum([...ENTITY_TYPES, 'tag']),
  title: z.string(),
  url: z.string().optional().describe('The markdown file; tags have none.'),
  status: z.enum(['published', 'deprecated']).optional(),
  companies: z.array(z.string()),
  tools: z.array(z.string()),
  workflows: z.array(z.string()),
  tags: z.array(z.string()),
})

type Target =
  | { kind: 'entity'; type: EntityType; key: string }
  | { kind: 'tag'; key: string }

const ABSOLUTE_URL = /^https?:\/\//
const TAG_KEY = /^([a-z]+):([a-z0-9-]+)$/
const QUERY_OR_HASH = /[?#]/
const VERSION_PIN = /@\d+$/
const NAMED = new Set<string>(TAG_NAMESPACES)

/** The path a page or `.md` URL names, or null when the input is no path. */
function pathOf(input: string): string | null {
  if (ABSOLUTE_URL.test(input)) {
    try {
      return new URL(input).pathname
    } catch {
      return null
    }
  }
  return input.startsWith('/') ? (input.split(QUERY_OR_HASH)[0] ?? null) : null
}

function resolve(input: string, catalog: Catalog): Target | null {
  const value = input.toLowerCase()
  const path = pathOf(value)
  if (path) {
    const ref = filePathToRef(path.endsWith('.md') ? path : `${path}.md`)
    return ref ? { kind: 'entity', ...ref } : null
  }
  const tag = TAG_KEY.exec(value)
  if (tag && NAMED.has(tag[1] ?? '')) {
    return catalog.tags.has(value) ? { kind: 'tag', key: value } : null
  }
  const ref = parseRef(value)
  if (ref) {
    return { kind: 'entity', ...ref }
  }
  // A bare key: `clay`, `clay/enrich-contacts`, `funding-signal-outbound`.
  const found = ENTITY_TYPES.filter((type) =>
    catalog.documents.has(formatRef(type, value))
  )
  const [only] = found
  return found.length === 1 && only
    ? { kind: 'entity', type: only, key: value }
    : null
}

function everyRef(catalog: Catalog): Array<string> {
  return [...catalog.documents.keys(), ...catalog.tags.keys()]
}

function tagAnswer(catalog: Catalog, key: string): ToolResult {
  const tag = catalog.tags.get(key)
  const members = relationsOf(catalog, key)
  const byRef = new Map(mcpEntries(catalog).map((entry) => [entry.ref, entry]))
  const section = (title: string, refs: ReadonlyArray<string>) =>
    refs.length === 0
      ? []
      : [
          '',
          `## ${title} (${refs.length})`,
          '',
          ...refs.map((ref) => {
            const entry = byRef.get(ref)
            return `- ${ref} — ${entry?.title ?? ref}: ${entry?.summary ?? ''}`
          }),
        ]
  const tools = members.tools.map((k) => formatRef('tool', k))
  const workflows = members.workflows.map((k) => formatRef('workflow', k))
  const companies = members.companies.map((k) => formatRef('company', k))
  const namespace = (tag?.namespace ?? 'capability') as TagNamespace
  const text = [
    `# ${tag?.label ?? key} (${key})`,
    '',
    TAG_NAMESPACE_MEANINGS[namespace],
    ...(tag && tag.synonyms.length > 0
      ? ['', `Also called: ${tag.synonyms.join(', ')}.`]
      : []),
    ...section('Tools', tools),
    ...section('Workflows', workflows),
    ...section('Companies', companies),
  ].join('\n')
  return {
    content: [{ type: 'text', text }],
    structuredContent: {
      ref: key,
      type: 'tag',
      title: tag?.label ?? key,
      companies,
      tools,
      workflows,
      tags: [],
    },
  }
}

function entityAnswer(
  catalog: Catalog,
  origin: string,
  type: EntityType,
  key: string
): ToolResult | null {
  const current = catalog.aliases.get(formatRef(type, key)) ?? key
  const ref = formatRef(type, current)
  const document = catalog.documents.get(ref)
  if (!document) {
    return null
  }
  const entity = {
    company: catalog.companies.get(current),
    tool: catalog.tools.get(current),
    workflow: catalog.workflows.get(current),
  }[type]
  const title =
    entity && 'title' in entity ? entity.title : (entity?.name ?? current)
  const links = relationsOf(catalog, ref)
  return {
    content: [{ type: 'text', text: document.markdown }],
    structuredContent: {
      ref,
      type,
      title,
      url: `${origin}${refToFilePath({ type, key: current })}`,
      ...(entity ? { status: entity.status } : {}),
      companies: links.companies.map((k) => formatRef('company', k)),
      tools: links.tools.map((k) => formatRef('tool', k)),
      workflows: links.workflows.map((k) => formatRef('workflow', k)),
      tags: [...links.tags],
    },
  }
}

export function runGet(
  catalog: Catalog,
  origin: string,
  args: z.infer<typeof getArgs>
): ToolResult {
  const target = resolve(args.ref, catalog)
  if (target?.kind === 'tag') {
    return tagAnswer(catalog, target.key)
  }
  const answer = target
    ? entityAnswer(catalog, origin, target.type, target.key)
    : null
  if (answer) {
    return answer
  }
  const hint = closest(args.ref.replace(VERSION_PIN, ''), everyRef(catalog))
  return toolError(
    `Nothing at "${args.ref}".${hint || ' Search for it instead.'}`
  )
}
