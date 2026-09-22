import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import type { CompanyListItem, ToolListItem } from '@/lib/catalog/types'
import { accessTypeLabels, agentLevelLabel } from './badges'
import { EntityLogo } from './entity-logo'

export type ToolCardData = ToolListItem
type CompanyRowData = CompanyListItem

/**
 * One row of a catalog directory: logo tile, name with small pills, one line
 * of description, and an arrow. The whole row is the link.
 */
function CatalogRow({
  href,
  logo,
  title,
  pills,
  description,
}: {
  href: string
  logo: { name: string; logoUrl?: string; domain?: string }
  title: string
  pills: ReadonlyArray<string>
  description: ReactNode
}) {
  return (
    <Item
      className="-mx-3 w-auto flex-nowrap gap-4 border-0 px-3 py-3 [a]:hover:bg-hover"
      render={<Link href={href} />}
    >
      <ItemMedia className="group-has-data-[slot=item-description]/item:translate-y-0 group-has-data-[slot=item-description]/item:self-center">
        <EntityLogo
          className="entity-shadow group-hover/item:entity-shadow-raised transition-shadow duration-300"
          domain={logo.domain}
          logoUrl={logo.logoUrl}
          name={logo.name}
          size={44}
        />
      </ItemMedia>
      <ItemContent className="min-w-0 gap-0.5">
        <ItemTitle className="type-item line-clamp-none flex w-full flex-wrap gap-x-2 gap-y-1">
          <span className="min-w-0 max-w-full truncate">{title}</span>
          {pills.map((pill) => (
            <Badge
              className="h-auto shrink-0 bg-background px-2 py-0.5"
              key={pill}
            >
              {pill}
            </Badge>
          ))}
        </ItemTitle>
        <ItemDescription className="type-body sm:line-clamp-1">
          {description}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <span className="grid size-7 shrink-0 place-items-center rounded-full border bg-background text-soft transition-colors duration-300 group-hover/item:border-foreground/20 group-hover/item:bg-transparent group-hover/item:text-foreground">
          <HugeiconsIcon
            aria-hidden="true"
            icon={ArrowRight02Icon}
            size={14}
            strokeWidth={2}
          />
        </span>
      </ItemActions>
    </Item>
  )
}

export function CompanyRow({
  company,
  access = [],
}: {
  company: CompanyRowData['company']
  /** How agents reach this company's tools: MCP, CLI, API. Real, not decorative. */
  access?: ReadonlyArray<string>
}) {
  return (
    <CatalogRow
      // The description is the fact; the tagline is ours. Prefer the fact.
      description={company.description ?? company.tagline}
      href={`/companies/${company.key}`}
      logo={{
        name: company.name,
        logoUrl: company.logoUrl,
        domain: company.domain,
      }}
      pills={access}
      title={company.name}
    />
  )
}

/** A tool in the directory, in the same row as a company. */
export function ToolRow({ tool, company }: ToolCardData) {
  const level = tool.agentLevel
  return (
    <CatalogRow
      description={
        <>
          <span className="text-soft">{company.name}</span> · {tool.summary}
        </>
      }
      href={`/tools/${tool.key}`}
      logo={{ name: company.name, logoUrl: company.logoUrl }}
      pills={[
        ...(level === 'unverified' ? [] : [agentLevelLabel(level)]),
        ...accessTypeLabels(tool.access),
      ]}
      title={tool.name}
    />
  )
}
