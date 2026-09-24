import { LinkSquare02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { CompanyAvatars } from '@/components/catalog/company-avatars'
import { ACCESS_CHIP, META_CHIP } from '@/components/detail/chrome'
import { DetailDescription } from '@/components/detail/detail-description'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils/cn'

export const DETAIL_DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

type BylineAvatar = {
  name: string
  src?: string

  logo?: boolean
}

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

  emphasis?: boolean
}

const TAG = 'type-meta inline-flex h-6 items-center rounded-full border px-2.5'
const TAG_HOVER =
  'focus-ring transition-colors duration-200 hover:border-foreground/20 hover:text-foreground'

export function DetailHeader({
  byline,
  title,
  titleBadge,
  description,
  stats = [],
  usedBy = [],
  actions,
  tags = [],
  tagsExtra,
  links = [],
  dates = [],
  available = [],
}: {
  byline: ReactNode
  title: string
  /** Sits beside the title: a status about the record itself. */
  titleBadge?: ReactNode
  description?: string
  stats?: ReadonlyArray<{ value: string; label: string }>
  usedBy?: ReadonlyArray<{ name: string; logo: string }>
  actions: ReactNode
  tags?: ReadonlyArray<DetailTag>
  /** Tags that carry their own behaviour, rendered after the plain ones. */
  tagsExtra?: ReactNode

  links?: ReadonlyArray<{ label: string; href: string; icon?: IconSvgElement }>
  dates?: ReadonlyArray<string>
  available?: ReadonlyArray<string>
}) {
  const hasHighlights = stats.length > 0 || usedBy.length > 0
  const hasSideMeta = dates.length > 0 || available.length > 0
  const hasTags = tags.length > 0 || links.length > 0 || tagsExtra !== undefined

  return (
    <div className="flex flex-col">
      <header>
        {byline}

        {/* The title and the actions share a row: what it is on the left,
            what you can do with it on the right. */}
        {/* A grid, not a flex row, so the DOM can read title -> summary ->
            actions. Stacked on a phone that is the order you want; from `sm`
            the grid lifts the actions into their own column beside both. */}
        <div className="mt-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-8">
          <div className="flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-2 sm:col-start-1 sm:row-start-1">
            <h1 className="type-page-title text-balance">{title}</h1>
            {titleBadge}
          </div>

          <div className="max-w-3xl sm:col-start-1 sm:row-start-2">
            {description ? <DetailDescription text={description} /> : null}

            {hasHighlights ? (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {stats.map((stat) => (
                  <span className={cn(META_CHIP, 'bg-hover')} key={stat.label}>
                    <b className="type-emphasis text-soft">{stat.value}</b>
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

          <div className="mt-6 flex shrink-0 flex-wrap items-center gap-2 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mt-0">
            {actions}
          </div>
        </div>
      </header>

      {hasTags || hasSideMeta ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                className={cn(TAG, TAG_HOVER, 'flex items-center gap-1.5')}
                href={link.href}
                key={link.label}
                rel="noreferrer"
                target="_blank"
              >
                {link.icon ? (
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={link.icon}
                    size={13}
                    strokeWidth={1.8}
                  />
                ) : null}
                {link.label}
                {link.icon ? null : (
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={LinkSquare02Icon}
                    size={11}
                    strokeWidth={1.8}
                  />
                )}
              </a>
            ))}

            {tagsExtra}
          </div>

          {/* The record's own facts: which revision, when it changed, and how
              to reach it. */}
          {hasSideMeta ? (
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
                <span className={ACCESS_CHIP} key={item}>
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
