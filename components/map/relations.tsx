import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { type MapNode, NodePill } from './node'

type Group = {
  relation: string
  direction: 'out' | 'in'
  nodes: Array<MapNode>
  isTruncated: boolean
}

export function RelationGroups({ groups }: { groups: Array<Group> }) {
  const populated = groups.filter((group) => group.nodes.length > 0)
  if (populated.length === 0) {
    return (
      <p className="type-helper text-faint">
        Nothing is connected to this node yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {populated.map((group) => (
        <section className="flex flex-col gap-3" key={group.relation}>
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              aria-hidden="true"
              className="text-subtle"
              icon={
                group.direction === 'in' ? ArrowLeft01Icon : ArrowRight01Icon
              }
              size={16}
              strokeWidth={1.8}
            />
            <h3 className="type-field-label">{group.relation}</h3>
            <span className="type-meta">
              {group.nodes.length}
              {group.isTruncated ? '+' : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.nodes.map((node) => (
              <NodePill key={`${node.type}:${node.key}`} node={node} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
