import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import type { EdgeGroup, MapNode } from '@/lib/types/catalog'
import { NeighborhoodGraph } from './graph'
import { catalogHref } from './node'
import { RelationGroups } from './relations'

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
          <p className="type-helper text-faint">
            {node.type} · {edges} {edges === 1 ? 'edge' : 'edges'}
          </p>
          <h2 className="type-section truncate">{node.name}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className={buttonVariants({ variant: 'outline', size: 'pill' })}
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
            className={buttonVariants({ variant: 'outline', size: 'pill' })}
            href="/map"
          >
            Whole map
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-2 sm:p-4">
        <NeighborhoodGraph groups={groups} node={node} />
      </div>

      <RelationGroups groups={groups} />
    </div>
  )
}
