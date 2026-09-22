import { LinkSquare02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CompanyAvatars } from '@/components/workflows/company-avatars'
import { cn } from '@/lib/utils/cn'

/** "Sep 16, 2026" — fixed to UTC so the server and every reader agree. */
export const DETAIL_DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

type BylineAvatar = {
  name: string
  src?: string
  /** A company mark: contained on white. A person fills the circle. */
  logo?: boolean
}

/** Who made it: overlapping avatars, then a line of text. */
export function DetailByline({
  avatars,
  children,
}: {
  avatars: ReadonlyArray<BylineAvatar>
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex [&>*+*]:-ml-2">
        {avatars.map((avatar) => {
          const fill = avatar.logo ? 'bg-background' : 'bg-muted'
          return (
            <Avatar
              className={cn('size-9 ring-2 ring-background', fill)}
              key={avatar.name}
            >
              {avatar.src ? (
                <AvatarImage
                  alt={avatar.name}
                  className={avatar.logo ? 'object-contain p-1.5' : undefined}
                  src={avatar.src}
                />
              ) : null}
              <AvatarFallback className={cn('type-label text-soft', fill)}>
                {avatar.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )
        })}
      </div>
      <p className="type-body text-subtle">{children}</p>
    </div>
  )
}

type DetailTag = {
  label: string
  href?: string
  /** The version pill: filled, one step stronger than the tags. */
  emphasis?: boolean
}

const TAG = 'type-meta rounded-full border px-2.5 py-1'
const TAG_HOVER =
  'transition-colors hover:border-foreground/20 hover:text-foreground'

/**
 * The head of a detail page (a workflow, a tool): byline, title, summary,
 * stats and "used by" logos, the page's actions on the right; then a row of
 * tags and outside links, with dates and "available as" on the right.
 */
export function DetailHeader({
  byline,
  title,
  description,
  stats = [],
  usedBy = [],
  actions,
  tags = [],
  links = [],
  dates = [],
  available = [],
}: {
  byline: ReactNode
  title: string
  description?: string
  stats?: ReadonlyArray<{ value: string; label: string }>
  usedBy?: ReadonlyArray<{ name: string; logo: string }>
  actions: ReactNode
  tags?: ReadonlyArray<DetailTag>
  /** Outside pages (website, docs); open in a new tab. */
  links?: ReadonlyArray<{ label: string; href: string }>
  dates?: ReadonlyArray<string>
  available?: ReadonlyArray<string>
}) {
  const hasHighlights = stats.length > 0 || usedBy.length > 0
  const hasMeta =
    tags.length > 0 ||
    links.length > 0 ||
    dates.length > 0 ||
    available.length > 0

  return (
    <div className="flex flex-col">
      <header className="border-b pb-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {byline}
            <h1 className="type-page-title mt-5 text-balance">{title}</h1>
            {description ? (
              <p className="type-lead mt-4 max-w-2xl">{description}</p>
            ) : null}

            {hasHighlights ? (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {stats.map((stat) => (
                  <span
                    className="type-label flex h-7 items-center rounded-full border bg-black/3 px-3 text-faint"
                    key={stat.label}
                  >
                    <b className="font-semibold text-soft">{stat.value}</b>
                    &nbsp;
                    {stat.label}
                  </span>
                ))}
                {usedBy.length > 0 ? (
                  <div
                    aria-label={`Used by ${usedBy.map((company) => company.name).join(', ')} and more teams`}
                    className="ml-1"
                    role="img"
                  >
                    <CompanyAvatars
                      companies={usedBy.map((company) => ({
                        key: company.name,
                        name: company.name,
                        logoUrl: company.logo,
                      }))}
                      more="+ more"
                      size="sm"
                      tooltips={false}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {actions}
          </div>
        </div>
      </header>

      {hasMeta ? (
        <div className="flex flex-col gap-4 border-b py-5 sm:flex-row sm:items-center sm:justify-between">
          {tags.length > 0 || links.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => {
                const className = tag.emphasis
                  ? cn(TAG, 'border-foreground/20 bg-hover text-soft')
                  : TAG
                return tag.href ? (
                  <Link
                    className={cn(className, TAG_HOVER)}
                    href={tag.href}
                    key={tag.label}
                  >
                    {tag.label}
                  </Link>
                ) : (
                  <span className={className} key={tag.label}>
                    {tag.label}
                  </span>
                )
              })}
              {links.map((link) => (
                <a
                  className={cn(TAG, TAG_HOVER, 'flex items-center gap-1')}
                  href={link.href}
                  key={link.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={LinkSquare02Icon}
                    size={11}
                    strokeWidth={1.8}
                  />
                </a>
              ))}
            </div>
          ) : null}
          <div className="type-label flex flex-wrap items-center gap-1.5 text-subtle sm:ml-auto">
            {dates.map((date) => (
              <span className="mr-2" key={date}>
                {date}
              </span>
            ))}
            {available.length > 0 ? (
              <span className="mr-1">Available as</span>
            ) : null}
            {available.map((item) => (
              <span
                className="rounded-full border bg-black/3 px-2.5 py-1"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
