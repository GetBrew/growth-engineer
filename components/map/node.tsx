import Link from 'next/link'
import {
  refToPath,
  splitVersionedKey,
  TAG_NAMESPACES,
} from '@/lib/catalog/keys'
import { cn } from '@/lib/utils/cn'

export type MapNode = {
  type: 'company' | 'tool' | 'workflow' | 'tag'
  key: string
  name: string
}

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

function focusHref(type: 'company' | 'tool' | 'workflow', key: string) {
  return `/map/${type}/${key}`
}

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

  if (version !== undefined) {
    const { key } = splitVersionedKey(node.key)
    return refToPath({ type: 'workflow', key, version })
  }
  return focusHref(node.type, node.key)
}

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
        'focus-ring type-label flex min-w-0 items-center gap-2 rounded-full border px-3 py-1.5 transition-colors duration-200',
        TONE[node.type]
      )}
      href={nodeHref(node)}
      title={node.key}
    >
      <span className="truncate">{node.name}</span>
    </Link>
  )
}
