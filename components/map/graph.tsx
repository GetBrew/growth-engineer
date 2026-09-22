import Link from 'next/link'
import type { MapNode } from '@/lib/catalog/types'
import { cn } from '@/lib/utils/cn'
import { NODE_FILL, nodeHref } from './node'

/**
 * The neighborhood, drawn. Server-rendered: an inline SVG draws the spokes,
 * and every node is a `next/link` laid over it at the same coordinates — so
 * the picture is as navigable as the list under it, a click is a client-side
 * navigation to a prerendered page (prefetched on hover), and an agent
 * reading the HTML sees the same edges a person does.
 *
 * WHY IT DRAWS ONLY A FEW PER GROUP: past a handful the labels collide and the
 * picture stops being one. The diagram is the shape; `RelationGroups` below it
 * is the complete, ordered truth. `+n more` says which one you are looking at.
 */

type Group = {
  relation: string
  direction: 'out' | 'in'
  nodes: Array<MapNode>
}

const WIDTH = 900
const HEIGHT = 540
const CX = WIDTH / 2
const CY = HEIGHT / 2
const RADIUS = 186

/** Past this the labels overlap; the rest live in the list below. */
const DRAWN_PER_GROUP = 5

/** Labels are drawn, not wrapped — long names get an ellipsis. */
function short(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

function polar(angleDegrees: number, radius: number) {
  const radians = (angleDegrees * Math.PI) / 180
  return {
    x: CX + radius * Math.cos(radians),
    y: CY + radius * Math.sin(radians),
  }
}

/** Where a label sits relative to its dot, so it reads away from the centre. */
type Side = 'start' | 'middle' | 'end'

/** Put the dot on the point: the link's box shifts by the dot's radius. */
const SHIFT: Record<Side, string> = {
  start: 'translate(-6px, -50%)',
  middle: 'translate(-50%, -6px)',
  end: 'translate(calc(-100% + 6px), -50%)',
}

function sideFor(angleDegrees: number): Side {
  const normalized = ((angleDegrees % 360) + 360) % 360
  if (normalized > 100 && normalized < 260) {
    return 'end'
  }
  if (normalized < 80 || normalized > 280) {
    return 'start'
  }
  return 'middle'
}

function percent(value: number, of: number): string {
  return `${(value / of) * 100}%`
}

/** A node as a link over the diagram: a dot at the point, the label beside it. */
function NodeLink({
  node,
  x,
  y,
  side,
}: {
  node: MapNode
  x: number
  y: number
  side: Side
}) {
  const dot = (
    <span
      aria-hidden="true"
      className={cn('size-3 shrink-0 rounded-full', NODE_DOT[node.type])}
    />
  )
  return (
    <Link
      className={cn(
        'absolute flex items-center gap-2 rounded-md text-[12px] text-foreground/75 leading-4 hover:text-foreground',
        side === 'middle' && 'flex-col gap-1',
        side === 'end' && 'flex-row-reverse'
      )}
      href={nodeHref(node)}
      style={{
        left: percent(x, WIDTH),
        top: percent(y, HEIGHT),
        transform: SHIFT[side],
      }}
      title={node.key}
    >
      {dot}
      <span className="whitespace-nowrap">{short(node.name, 22)}</span>
    </Link>
  )
}

const NODE_DOT = {
  company: 'bg-company',
  tool: 'bg-tool',
  workflow: 'bg-workflow',
  tag: 'bg-tag',
} as const

export function NeighborhoodGraph({
  node,
  groups,
}: {
  node: MapNode
  groups: Array<Group>
}) {
  const drawn = groups.filter((group) => group.nodes.length > 0)
  if (drawn.length === 0) {
    return null
  }
  const links: Array<{ node: MapNode; x: number; y: number; side: Side }> = []

  return (
    <div className="relative">
      <svg
        aria-label={`Relationship diagram for ${node.name}`}
        className="h-auto w-full"
        role="img"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{`What ${node.name} is connected to`}</title>

        {drawn.map((group, groupIndex) => {
          // Spokes are spread evenly around the circle, starting at the top.
          const base = -90 + (360 / drawn.length) * groupIndex
          const visible = group.nodes.slice(0, DRAWN_PER_GROUP)
          // Fan the group's nodes across its own share of the circle, never
          // wider than the share itself so two groups cannot interleave.
          const share = 360 / drawn.length
          const step = Math.min(share / (DRAWN_PER_GROUP + 1), 15)
          const label = polar(base, RADIUS + 66)
          const overflow = group.nodes.length - visible.length

          return (
            <g key={group.relation}>
              <text
                className="fill-foreground/55 font-medium text-[13px]"
                textAnchor={sideFor(base)}
                x={label.x}
                y={label.y}
              >
                {group.direction === 'in'
                  ? `← ${group.relation}`
                  : `${group.relation} →`}
                {overflow > 0 ? ` (+${overflow})` : ''}
              </text>

              {visible.map((child, childIndex) => {
                const angle =
                  base + (childIndex - (visible.length - 1) / 2) * step
                const at = polar(angle, RADIUS)
                links.push({
                  node: child,
                  x: at.x,
                  y: at.y,
                  side: sideFor(angle),
                })
                return (
                  <line
                    className="stroke-foreground/12"
                    key={`${child.type}:${child.key}`}
                    strokeWidth={1}
                    x1={CX}
                    x2={at.x}
                    y1={CY}
                    y2={at.y}
                  />
                )
              })}
            </g>
          )
        })}

        <circle
          className="fill-background stroke-foreground/15"
          cx={CX}
          cy={CY}
          r={46}
          strokeWidth={1}
        />
        <circle className={NODE_FILL[node.type]} cx={CX} cy={CY} r={9} />
        <text
          className="fill-foreground font-semibold text-[13px]"
          textAnchor="middle"
          x={CX}
          y={CY + 30}
        >
          {short(node.name, 16)}
        </text>
      </svg>

      {links.map((link) => (
        <NodeLink key={`${link.node.type}:${link.node.key}`} {...link} />
      ))}
    </div>
  )
}
