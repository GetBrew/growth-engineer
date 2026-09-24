import { LinkSquare02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { accessTypeLabel } from '@/components/catalog/badges'
import { PANEL_HEADING } from '@/components/detail/chrome'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { authLine } from '@/lib/catalog/auth-line'
import { orderAccess } from '@/lib/catalog/render-access'
import type { Tool as CatalogTool } from '@/lib/types/catalog'

type Tool = Pick<CatalogTool, 'access' | 'agent'>
type Access = Tool['access'][number]

/**
 * Every way into the tool, best first — the same order the file's "Set up"
 * section uses. One row per route: what it is, who stands behind it, the exact
 * call to make, what it asks of you, and where its documentation lives.
 *
 * The primitive sets `text-sm`; the type roles below override it, so every
 * cell still comes from the scale.
 */
export function ToolAccessPanel({ tool }: { tool: Tool }) {
  const access = orderAccess(tool.access)

  return (
    <section className="flex flex-col">
      <h2 className={PANEL_HEADING}>Ways in</h2>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="type-meta pl-0">Route</TableHead>
            <TableHead className="type-meta">Source</TableHead>
            <TableHead className="type-meta">Call</TableHead>
            <TableHead className="type-meta">Required</TableHead>
            <TableHead className="type-meta pr-0 text-right">Docs</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {access.map((entry) => (
            <TableRow key={`${entry.type}:${entry.operation}`}>
              <TableCell className="py-4 pl-0">
                <Badge variant="soft">{accessTypeLabel(entry.type)}</Badge>
              </TableCell>
              {/* Who stands behind it is a fact about the row, not a status
                  worth a colour of its own — it reads as quiet text. */}
              <TableCell className="type-helper py-4 text-soft">
                {originLine(entry)}
              </TableCell>
              <TableCell className="py-4">
                <code className="type-label rounded-md bg-muted px-2 py-1 font-mono">
                  {entry.operation}
                </code>
              </TableCell>
              <TableCell className="type-helper py-4 text-soft">
                {authLine(entry.auth)}
              </TableCell>
              <TableCell className="py-4 pr-0 text-right">
                {entry.docsUrl ? (
                  <a
                    className="focus-ring type-helper inline-flex items-center gap-1 rounded-sm text-foreground underline-offset-4 transition-colors duration-200 hover:underline"
                    href={entry.docsUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Docs
                    <HugeiconsIcon
                      aria-hidden="true"
                      icon={LinkSquare02Icon}
                      size={11}
                      strokeWidth={1.8}
                    />
                  </a>
                ) : (
                  <span className="type-helper text-faint">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

/** Who stands behind this way in, and the detail that qualifies it. */
function originLine(entry: Access): string {
  if (entry.official) {
    return entry.type === 'mcp' ? `Official · ${entry.transport}` : 'Official'
  }
  return entry.maintainer ? `Community · ${entry.maintainer}` : 'Community'
}
