import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { accessTypeLabels, agentLevelLabel } from '@/components/catalog/badges'
import type { ToolCardData } from '@/components/catalog/cards'
import { EntityLogo } from '@/components/catalog/entity-logo'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { WorkflowRowData } from '@/components/workflows/workflow-row'

export type CatalogListItem = {
  id: string
  href: string
  title: string
  logo: { name: string; logoUrl?: string; domain?: string }
  pills: ReadonlyArray<string>
  description?: ReactNode
}

export function CatalogList({
  items,
  all,
}: {
  items: ReadonlyArray<CatalogListItem>
  all?: { href: string; label: string }
}) {
  return (
    <div className="flex flex-col items-center gap-8">
      <ul className="flex w-full flex-col border-t">
        {items.map((item) => (
          <li className="border-b" key={item.id}>
            <CatalogListRow {...item} />
          </li>
        ))}
      </ul>
      {all ? (
        <Link
          className={buttonVariants({ variant: 'outline', size: 'pill' })}
          href={all.href}
        >
          {all.label}
          <HugeiconsIcon
            aria-hidden="true"
            data-icon="inline-end"
            icon={ArrowRight02Icon}
            size={16}
            strokeWidth={1.8}
          />
        </Link>
      ) : null}
    </div>
  )
}

function CatalogListRow({
  href,
  title,
  logo,
  pills,
  description,
}: CatalogListItem) {
  return (
    <Link
      className="focus-ring flex items-center gap-4 rounded-lg py-5"
      href={href}
    >
      <EntityLogo
        className="entity-shadow shrink-0"
        domain={logo.domain}
        logoUrl={logo.logoUrl}
        name={logo.name}
        size={44}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="type-item min-w-0 max-w-full truncate">{title}</span>
          {pills.map((pill) => (
            <Badge
              className="h-auto shrink-0 bg-background px-2 py-0.5"
              key={pill}
            >
              {pill}
            </Badge>
          ))}
        </div>
        {description ? (
          <p className="type-body sm:line-clamp-1">{description}</p>
        ) : null}
      </div>
      <span className="grid size-7 shrink-0 place-items-center rounded-full border bg-background text-soft">
        <HugeiconsIcon
          aria-hidden="true"
          icon={ArrowRight02Icon}
          size={14}
          strokeWidth={2}
        />
      </span>
    </Link>
  )
}

export function workflowListItem({
  workflow,
  tools,
}: WorkflowRowData): CatalogListItem {
  const lead = tools[0]
  return {
    id: workflow._id,
    href: `/workflows/${workflow.key}`,
    title: workflow.title,
    logo: {
      name: lead?.companyName ?? workflow.title,
      logoUrl: lead?.logoUrl,
    },
    pills: [
      `${workflow.toolCount} ${workflow.toolCount === 1 ? 'tool' : 'tools'}`,
    ],
    description: workflow.summary,
  }
}

export function toolListItem({ tool, company }: ToolCardData): CatalogListItem {
  return {
    id: tool._id,
    href: `/tools/${tool.key}`,
    title: tool.name,
    logo: { name: company.name, logoUrl: company.logoUrl },
    pills: [
      ...(tool.agentLevel === 'unverified'
        ? []
        : [agentLevelLabel(tool.agentLevel)]),
      ...accessTypeLabels(tool.access),
    ],
    description: `${company.name} · ${tool.summary}`,
  }
}
