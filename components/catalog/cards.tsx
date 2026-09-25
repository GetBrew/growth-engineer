import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { accessTypeLabels } from '@/components/common/badges'
import { EntityLogo } from '@/components/common/entity-logo'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import type { CompanyListItem, ToolListItem } from '@/lib/types/catalog'

export type ToolCardData = ToolListItem
type CompanyRowData = CompanyListItem

function CatalogRow({
  href,
  logo,
  title,
  pills,
  description,
}: {
  href: string
  logo: { name: string; logoUrl?: string }
  title: string
  pills: ReadonlyArray<string>
  description: ReactNode
}) {
  return (
    <Item
      className="-mx-3 w-auto flex-nowrap gap-4 border-0 px-3 py-4 [a]:hover:bg-hover"
      render={<Link href={href} />}
    >
      <ItemMedia className="group-has-data-[slot=item-description]/item:translate-y-0 group-has-data-[slot=item-description]/item:self-center">
        <EntityLogo
          className="entity-shadow group-hover/item:entity-shadow-raised transition-shadow duration-300"
          logoUrl={logo.logoUrl}
          name={logo.name}
          size={44}
        />
      </ItemMedia>
      <ItemContent className="min-w-0 gap-1">
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
        <span className="grid size-7 shrink-0 place-items-center text-soft transition-colors duration-300 group-hover/item:text-foreground">
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

  access?: ReadonlyArray<string>
}) {
  return (
    <CatalogRow
      description={company.description ?? company.tagline}
      href={`/companies/${company.key}`}
      logo={{
        name: company.name,
        logoUrl: company.logoUrl,
      }}
      pills={access}
      title={company.name}
    />
  )
}

export function ToolRow({ tool, company }: ToolCardData) {
  return (
    <CatalogRow
      description={
        <>
          <span className="text-soft">{company.name}</span> · {tool.summary}
        </>
      }
      href={`/tools/${tool.key}`}
      logo={{ name: company.name, logoUrl: company.logoUrl }}
      pills={accessTypeLabels(tool.access)}
      title={tool.name}
    />
  )
}
