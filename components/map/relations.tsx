import { ArrowLeft, ArrowRight } from 'lucide-react'
import { type MapNode, NodePill } from './node'

/**
 * The complete edge list under the diagram. The diagram draws a handful per
 * relation so it stays readable; this is every edge, in order, and it is what
 * an agent reading the page gets. Direction is stated, not implied by layout:
 * "used by" pointing IN at a tool is a different fact from "uses" pointing out.
 */

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
      <p className="text-foreground/55 text-sm">
        Nothing is connected to this node yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {populated.map((group) => (
        <section className="flex flex-col gap-3" key={group.relation}>
          <div className="flex items-center gap-2">
            {group.direction === 'in' ? (
              <ArrowLeft
                aria-hidden="true"
                className="size-4 text-foreground/45"
              />
            ) : (
              <ArrowRight
                aria-hidden="true"
                className="size-4 text-foreground/45"
              />
            )}
            <h3 className="font-medium text-sm">{group.relation}</h3>
            <span className="font-medium text-foreground/45 text-xs">
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
