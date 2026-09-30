import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { ToolCardData } from '@/components/catalog/cards'
import {
  type CompanyAvatar,
  CompanyAvatars,
} from '@/components/common/company-avatars'
import { EntityIcon, type EntityKind } from '@/components/common/entity-icon'
import { EntityLogo } from '@/components/common/entity-logo'
import { MaskIcon } from '@/components/layout/mask-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { githubAvatarUrl } from '@/lib/github'
import type { WorkflowListItem } from '@/lib/types/catalog'

export type CatalogListItem = {
  id: string
  href: string
  title: string
  logo: { name: string; logoUrl?: string }
  description?: ReactNode

  contributor?: { name?: string; imageUrl?: string }

  entity?: EntityKind

  companies?: ReadonlyArray<CompanyAvatar>

  usage?: ReactNode
}

const MAX_COMPANIES = 3

export function CatalogList({
  items,
  all,
}: {
  items: ReadonlyArray<CatalogListItem>
  all?: { href: string; label: string }
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <ul className="flex w-full flex-col">
        {items.map((item) => (
          <li className="border-b last:border-b-0" key={item.id}>
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
  description,
  contributor,
  companies,
  entity,
  usage,
}: CatalogListItem) {
  return (
    <Link
      className="focus-ring group/row flex min-h-21.5 items-center gap-4 rounded-lg py-4"
      href={href}
    >
      {companies ? (
        <Contributor contributor={contributor} entity={entity} />
      ) : (
        <EntityLogo
          className="entity-shadow shrink-0"
          logoUrl={logo.logoUrl}
          name={logo.name}
          size={44}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="type-item min-w-0 max-w-full truncate text-foreground">
          {title}
        </span>
        {description ? (
          <p className="type-helper truncate text-soft">{description}</p>
        ) : null}
      </div>

      {companies || usage !== undefined ? (
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {companies ? (
            <div className="flex w-27.5 justify-end">
              {companies.length > 0 ? (
                <CompanyAvatars
                  companies={companies.slice(0, MAX_COMPANIES)}
                  links={false}
                  more={
                    companies.length > MAX_COMPANIES
                      ? `+${companies.length - MAX_COMPANIES}`
                      : undefined
                  }
                  size="sm"
                />
              ) : null}
            </div>
          ) : null}
          {usage === undefined ? null : (
            <div className="flex w-20 flex-col items-end gap-0.5 whitespace-nowrap text-right">
              {usage}
            </div>
          )}
        </div>
      ) : null}
    </Link>
  )
}

function Contributor({
  contributor,
  entity,
}: {
  contributor?: { name?: string; imageUrl?: string }

  entity?: EntityKind
}) {
  return (
    <span className="relative block size-10 shrink-0">
      {entity ? (
        <span className="grid size-10 place-items-center rounded-full border border-border bg-background text-soft">
          <EntityIcon entity={entity} size={18} />
        </span>
      ) : (
        <Avatar className="size-10 border border-border">
          <AvatarImage alt="" src={contributor?.imageUrl} />
          <AvatarFallback>
            {(contributor?.name ?? '?').slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      {entity ? null : (
        <span className="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-background ring-2 ring-background">
          <MaskIcon className="text-soft" size={12} src="/social/github.svg" />
        </span>
      )}
      {contributor?.name ? (
        <span className="sr-only">Contributed by {contributor.name}</span>
      ) : null}
    </span>
  )
}

export function workflowListItem({
  workflow,
  tools,
}: WorkflowListItem): CatalogListItem {
  const lead = tools[0]

  const companies = [
    ...new Map(
      tools.map((tool) => [
        tool.companyKey,
        {
          key: tool.companyKey,
          name: tool.companyName,
          ...(tool.logoUrl === undefined ? {} : { logoUrl: tool.logoUrl }),
        },
      ])
    ).values(),
  ]

  return {
    id: workflow.key,
    companies,
    contributor: {
      name: workflow.author,
      imageUrl: githubAvatarUrl(workflow.author),
    },
    href: `/workflows/${workflow.key}`,
    title: workflow.title,
    logo: {
      name: lead?.companyName ?? workflow.title,
      logoUrl: lead?.logoUrl,
    },
    description: workflow.summary,
  }
}

export function toolListItem({ tool, company }: ToolCardData): CatalogListItem {
  return {
    id: tool.key,
    href: `/tools/${tool.key}`,
    title: tool.name,
    logo: { name: company.name, logoUrl: company.logoUrl },
    description: `${company.name} · ${tool.summary}`,
  }
}
