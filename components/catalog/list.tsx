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

  /**
   * Draws the kind's own icon in the leading slot instead of a photo. A guide
   * is about workflows or tools in general, so there is no one logo or face
   * that stands for it. The icon stays in ink: the entity colours mark a real
   * entry, and a row about a kind is not one.
   */
  entity?: EntityKind

  companies?: ReadonlyArray<CompanyAvatar>

  /**
   * A count at the row's right edge (`CopyMetric`), or a `<Suspense>` that
   * streams one in. Its slot has one width on every row, so the counts line
   * up and the column beside them stays put while they land.
   */
  metric?: ReactNode
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
  metric,
}: CatalogListItem) {
  return (
    <Link
      className="focus-ring group/row flex items-center gap-4 rounded-lg py-4"
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
        <span className="type-item min-w-0 max-w-full truncate">{title}</span>
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

      {metric === undefined ? null : (
        <span className="flex w-12 shrink-0 justify-end">{metric}</span>
      )}

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

      {/* The badge says whose face this is and where to find them. A kind's
          icon is nobody's face, so it carries no badge. */}
      {entity ? null : (
        <span className="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-background ring-2 ring-background">
          <MaskIcon
            className="text-muted-foreground"
            size={12}
            src="/social/github.svg"
          />
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
