import { LinkSquare02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { DetailDescription } from '@/components/detail/summary'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge, badgeVariants } from '@/components/ui/badge'
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

export type DetailTag = {
  label: string
  href?: string

  emphasis?: boolean
}

/** One tag as a pill: a link to the listing it filters, or plain. */
export function DetailTagPill({ tag }: { tag: DetailTag }) {
  const variant = tag.emphasis ? 'emphasis' : 'plain'
  return tag.href ? (
    <Link
      className={badgeVariants({ variant, interactive: true })}
      href={tag.href}
    >
      {tag.label}
    </Link>
  ) : (
    <Badge variant={variant}>{tag.label}</Badge>
  )
}

export function DetailHeader({
  byline,
  title,
  description,
  actions,
  tags = [],
  links = [],
  dates = [],
  available = [],
  meta,
}: {
  byline: ReactNode
  title: string
  description?: string
  /** Beside the title from lg. A page with a side column (a workflow's) keeps
      them there instead, and its title and summary take the full width. */
  actions?: ReactNode
  tags?: ReadonlyArray<DetailTag>
  links?: ReadonlyArray<{ label: string; href: string; icon?: IconSvgElement }>
  dates?: ReadonlyArray<string>
  available?: ReadonlyArray<string>
  /** A quiet line under the description, like "Updated Sep 27, 2026". */
  meta?: string
}) {
  const hasSideMeta = dates.length > 0 || available.length > 0
  const hasTags = tags.length > 0 || links.length > 0

  return (
    <div className="flex flex-col">
      <header>
        {byline}

        {/* The actions join the title's row only from lg: on a tablet they
            squeezed the title into a column a few words wide. */}
        <div className="mt-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-x-8">
          <div
            className={cn(
              'flex flex-wrap items-center gap-x-3 gap-y-2 lg:col-start-1 lg:row-start-1',
              actions ? 'max-w-3xl' : 'max-w-5xl'
            )}
          >
            <h1 className="type-page-title text-balance">{title}</h1>
          </div>

          <div
            className={cn(
              'lg:col-start-1 lg:row-start-2',
              actions && 'max-w-3xl'
            )}
          >
            {description ? (
              <DetailDescription
                className={actions ? undefined : 'max-w-4xl'}
                text={description}
              />
            ) : null}
            {meta ? (
              <p className="type-label mt-3 text-subtle">{meta}</p>
            ) : null}
          </div>

          {actions ? (
            <div className="mt-6 flex shrink-0 items-center gap-2 max-lg:-ml-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
              {actions}
            </div>
          ) : null}
        </div>
      </header>

      {hasTags || hasSideMeta ? (
        // Side by side only from lg, like the actions above: on a tablet both
        // halves wrapped, leaving a tag and a chip stranded on lines of their own.
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <DetailTagPill key={tag.label} tag={tag} />
            ))}

            {links.map((link) => (
              <a
                className={cn(
                  badgeVariants({ variant: 'plain', interactive: true }),
                  'gap-1.5'
                )}
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
          </div>

          {hasSideMeta ? (
            <div className="type-label flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 text-subtle">
              {dates.map((date) => (
                <span key={date}>{date}</span>
              ))}
              {/* One unit, so a narrow screen wraps the whole group rather
                  than leaving its last chip alone on a line. */}
              {available.length > 0 ? (
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="mr-1">Ways in</span>
                  {available.map((item) => (
                    <Badge key={item} size="label" variant="access">
                      {item}
                    </Badge>
                  ))}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
