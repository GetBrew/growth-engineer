import Link from 'next/link'
import {
  refToPath,
  splitVersionedKey,
  TAG_NAMESPACES,
} from '@/lib/catalog/keys'
import { cn } from '@/lib/utils/cn'

/**
 * A node in the relationship map, and the one place that decides where a node
 * links to. Two destinations, and which one you get is the whole interaction
 * model: a company, tool or workflow keeps you IN the map (clicking explores
 * the graph), while a tag or a pinned version leaves for the catalog, because
 * neither is a node you can stand on.
 */

export type MapNode = {
  type: 'company' | 'tool' | 'workflow' | 'tag'
  key: string
  name: string
}

/** One hue per kind, from the data-model doc — the same set the badges use. */
const TONE = {
  company:
    'border-company/25 bg-company/5 text-company hover:border-company/50',
  tool: 'border-tool/25 bg-tool/5 text-tool hover:border-tool/50',
  workflow:
    'border-workflow/25 bg-workflow/5 text-workflow hover:border-workflow/50',
  tag: 'border-tag/25 bg-tag/5 text-tag hover:border-tag/50',
} as const

export const NODE_FILL = {
  company: 'fill-company',
  tool: 'fill-tool',
  workflow: 'fill-workflow',
  tag: 'fill-tag',
} as const

/** `/map/tool/clay/enrich-contacts` — a prerendered page per node. */
function focusHref(type: 'company' | 'tool' | 'workflow', key: string) {
  return `/map/${type}/${key}`
}

/**
 * A tag is not focusable — it has no page of its own — so it links to the
 * catalog filter it names, built the same way the search chips build it.
 */
function tagHref(key: string): string {
  const namespace = TAG_NAMESPACES.find((candidate) =>
    key.startsWith(`${candidate}:`)
  )
  return namespace
    ? `/tools?${namespace}=${encodeURIComponent(key.slice(namespace.length + 1))}`
    : '/tools'
}

export function nodeHref(node: MapNode): string {
  if (node.type === 'tag') {
    return tagHref(node.key)
  }
  const { version } = splitVersionedKey(node.key)
  // A pinned version is a page, not a graph node: there is nothing else
  // attached to `@3` that is not attached to the workflow itself.
  if (version !== undefined) {
    const { key } = splitVersionedKey(node.key)
    return refToPath({ type: 'workflow', key, version })
  }
  return focusHref(node.type, node.key)
}

/** Where this node lives in the catalog, for the "open page" affordance. */
export function catalogHref(node: MapNode): string {
  if (node.type === 'tag') {
    return tagHref(node.key)
  }
  const { key, version } = splitVersionedKey(node.key)
  return refToPath({ type: node.type, key, version })
}

export function NodePill({ node }: { node: MapNode }) {
  return (
    <Link
      className={cn(
        'focus-ring flex min-w-0 items-center gap-2 rounded-full border px-3 py-1.5 font-medium text-xs transition-colors',
        TONE[node.type]
      )}
      href={nodeHref(node)}
      title={node.key}
    >
      <span className="truncate">{node.name}</span>
    </Link>
  )
}
