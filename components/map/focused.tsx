import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { EdgeGroup, MapNode } from '@/lib/catalog/types'
import { NeighborhoodGraph } from './graph'
import { catalogHref } from './node'
import { RelationGroups } from './relations'

/** One node and everything touching it: the header, the diagram, the list. */
export function FocusedNode({
  node,
  groups,
}: {
  node: MapNode
  groups: Array<EdgeGroup>
}) {
  const edges = groups.reduce((total, group) => total + group.nodes.length, 0)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-foreground/55 text-sm">
            {node.type} · {edges} {edges === 1 ? 'edge' : 'edges'}
          </p>
          <h2 className="truncate font-semibold text-2xl tracking-[-0.02em]">
            {node.name}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="focus-ring flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-foreground/62 text-sm transition-colors hover:border-foreground/20 hover:text-foreground"
            href={catalogHref(node)}
          >
            Open page
            <HugeiconsIcon
              aria-hidden="true"
              icon={ArrowUpRight01Icon}
              size={16}
              strokeWidth={1.8}
            />
          </Link>
          <Link
            className="focus-ring flex h-10 items-center rounded-full border border-border bg-white px-4 text-foreground/62 text-sm transition-colors hover:border-foreground/20 hover:text-foreground"
            href="/map"
          >
            Whole map
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-2 sm:p-4">
        <NeighborhoodGraph groups={groups} node={node} />
      </div>

      <RelationGroups groups={groups} />
    </div>
  )
}

export function MapSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-[520px] w-full animate-pulse rounded-2xl bg-muted"
    />
  )
}
