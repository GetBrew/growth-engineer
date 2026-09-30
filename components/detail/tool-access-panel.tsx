import { LinkSquare02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { accessTypeLabel } from '@/components/common/badges'
import { PANEL_HEADING } from '@/components/detail/styles'
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

type Tool = Pick<CatalogTool, 'access'>
type Access = Tool['access'][number]

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
              <TableCell className="type-helper py-4 text-soft">
                {originLine(entry)}
              </TableCell>
              <TableCell className="py-4">
                <code className="type-code rounded bg-muted px-1.5 py-0.5 text-foreground">
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
                      size={12}
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

function originLine(entry: Access): string {
  if (entry.official) {
    return entry.type === 'mcp' ? `Official · ${entry.transport}` : 'Official'
  }
  return entry.maintainer ? `Community · ${entry.maintainer}` : 'Community'
}
