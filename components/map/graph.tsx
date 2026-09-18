import { type MapNode, NODE_FILL, nodeHref } from './node'

/**
 * The neighborhood, drawn. Server-rendered inline SVG: no graph library, no
 * client JavaScript, no layout engine — a focused node in the middle and one
 * spoke per relation. Every circle is a real `<a>`, so the picture is as
 * navigable as the list under it and an agent reading the HTML sees the same
 * edges a person does.
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

  return (
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
              textAnchor={anchorFor(base)}
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
              const textAnchor = anchorFor(angle)
              return (
                // A plain SVG <a>, not next/link: inside an <svg> tree the
                // anchor belongs to the SVG namespace, and this keeps the
                // diagram entirely free of client JavaScript.
                <a href={nodeHref(child)} key={`${child.type}:${child.key}`}>
                  <line
                    className="stroke-foreground/12"
                    strokeWidth={1}
                    x1={CX}
                    x2={at.x}
                    y1={CY}
                    y2={at.y}
                  />
                  <circle
                    className={NODE_FILL[child.type]}
                    cx={at.x}
                    cy={at.y}
                    r={6}
                  />
                  <text
                    className="fill-foreground/75 text-[12px]"
                    textAnchor={textAnchor}
                    x={at.x + offsetFor(textAnchor)}
                    y={at.y + 4}
                  >
                    {short(child.name, 22)}
                  </text>
                </a>
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
  )
}

/** Labels sit outside the circle, so they read away from the centre. */
function anchorFor(angleDegrees: number): 'start' | 'middle' | 'end' {
  const normalized = ((angleDegrees % 360) + 360) % 360
  if (normalized > 100 && normalized < 260) {
    return 'end'
  }
  if (normalized < 80 || normalized > 280) {
    return 'start'
  }
  return 'middle'
}

function offsetFor(anchor: 'start' | 'middle' | 'end'): number {
  if (anchor === 'start') {
    return 12
  }
  if (anchor === 'end') {
    return -12
  }
  return 0
}
