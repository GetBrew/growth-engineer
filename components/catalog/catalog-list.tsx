import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { accessTypeLabels, agentLevelLabel } from '@/components/catalog/badges'
import type { ToolCardData } from '@/components/catalog/cards'
import {
  type CompanyAvatar,
  CompanyAvatars,
} from '@/components/catalog/company-avatars'
import { EntityLogo } from '@/components/catalog/entity-logo'
import { MaskIcon } from '@/components/layout/mask-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { githubAvatarUrl } from '@/lib/github'
import type { WorkflowListItem } from '@/lib/types/catalog'

export type CatalogListItem = {
  id: string
  href: string
  title: string
  logo: { name: string; logoUrl?: string }
  pills: ReadonlyArray<string>
  description?: ReactNode

  contributor?: { name?: string; imageUrl?: string }

  companies?: ReadonlyArray<CompanyAvatar>
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
    // The last row brings 16px of its own padding, so 16 here reads as the
    // 32px that separates the list from the action under it.
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
  pills,
  description,
  contributor,
  companies,
}: CatalogListItem) {
  return (
    <Link
      className="focus-ring group/row flex items-center gap-4 rounded-lg py-4"
      href={href}
    >
      {companies ? (
        <Contributor contributor={contributor} />
      ) : (
        <EntityLogo
          className="entity-shadow shrink-0"
          logoUrl={logo.logoUrl}
          name={logo.name}
          size={44}
        />
      )}

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
          <p className="type-body line-clamp-2 sm:line-clamp-1">
            {description}
          </p>
        ) : null}
      </div>

      {companies && companies.length > 0 ? (
        <div className="hidden sm:block">
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
        </div>
      ) : null}

      <span className="hidden size-7 shrink-0 place-items-center text-soft opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 group-focus-visible/row:opacity-100 sm:grid">
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

function Contributor({
  contributor,
}: {
  contributor?: { name?: string; imageUrl?: string }
}) {
  return (
    <span className="relative block size-10 shrink-0">
      <Avatar className="size-10 border border-border">
        <AvatarImage alt="" src={contributor?.imageUrl} />
        <AvatarFallback>
          {(contributor?.name ?? '?').slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <span className="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-background ring-2 ring-background">
        <MaskIcon
          className="text-muted-foreground"
          size={12}
          src="/social/github.svg"
        />
      </span>
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
    companies, // ← this is what selects the layout
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
    pills: [
      `${workflow.toolCount} ${workflow.toolCount === 1 ? 'tool' : 'tools'}`,

      ...accessTypeLabels(tools.flatMap((tool) => tool.access)),
    ],
    description: workflow.summary,
  }
}

export function toolListItem({ tool, company }: ToolCardData): CatalogListItem {
  return {
    id: tool.key,
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
