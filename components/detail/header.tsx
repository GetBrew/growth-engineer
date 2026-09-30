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
    <div className="flex items-center gap-2">
      <div className="flex [&>*+*]:-ml-2">
        {avatars.map((avatar) => {
          const fill = avatar.logo ? 'bg-background' : 'bg-muted'
          return (
            <Avatar
              className={cn('size-6 ring-2 ring-background', fill)}
              key={avatar.name}
            >
              {avatar.src ? (
                <AvatarImage alt={avatar.name} src={avatar.src} />
              ) : null}
              <AvatarFallback className={cn('type-label text-soft', fill)}>
                {avatar.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )
        })}
      </div>
      <p className="type-helper text-soft">{children}</p>
    </div>
  )
}

export type DetailTag = {
  label: string
  href?: string

  emphasis?: boolean
}

function DetailTagPill({ tag }: { tag: DetailTag }) {
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
  meta,
  shouldClampDescription = true,
  hasIconActions = false,
  hasButtonActions = false,
}: {
  byline: ReactNode
  title: string
  description?: string
  /** Beside the title from lg. A page with a side column (a workflow's) keeps
      them there instead, and its title and summary take the full width. */
  actions?: ReactNode
  tags?: ReadonlyArray<DetailTag>
  meta?: string
  shouldClampDescription?: boolean
  hasIconActions?: boolean
  /** The actions are full buttons (a tool's Copy and Open in): under lg
      they share the page's width, edge to edge, each taking half. */
  hasButtonActions?: boolean
}) {
  const hasTags = tags.length > 0

  return (
    <div className="flex flex-col">
      <header>
        {hasIconActions && actions ? (
          <div className="flex items-center justify-between gap-3">
            {byline}
            <div className="-my-2 -mr-2 flex shrink-0 items-center lg:hidden">
              {actions}
            </div>
          </div>
        ) : (
          byline
        )}
        <div
          className={cn(
            'lg:grid lg:grid-cols-(--grid-header) lg:items-start lg:gap-x-8',
            byline ? 'mt-3' : undefined
          )}
        >
          <div className="flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-2 lg:col-start-1 lg:row-start-1">
            <h1 className="type-page-title text-balance">
              <UnbrokenHyphens text={title} />
            </h1>
          </div>

          <div className="lg:col-start-1 lg:row-start-2">
            {description && shouldClampDescription ? (
              <DetailDescription text={description} />
            ) : null}
            {description && !shouldClampDescription ? (
              <p className="type-body mt-2 max-w-2xl">{description}</p>
            ) : null}
            {meta && !hasTags ? (
              <p className="type-label mt-3 text-subtle">{meta}</p>
            ) : null}
          </div>

          {actions ? (
            <div
              className={cn(
                'mt-6 flex shrink-0 items-center gap-2 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0',
                hasButtonActions ? 'max-lg:*:flex-1' : 'max-lg:-ml-3',
                hasIconActions && 'max-lg:hidden'
              )}
            >
              {actions}
            </div>
          ) : null}
        </div>
      </header>

      {hasTags ? (
        <div className="mt-6 flex min-w-0 flex-wrap items-center gap-1.5">
          {meta ? (
            <span className="type-label mr-2 text-subtle">{meta}</span>
          ) : null}

          {tags.map((tag) => (
            <DetailTagPill key={tag.label} tag={tag} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

const HYPHENATED = /(\S+-\S+)/

function UnbrokenHyphens({ text }: { text: string }) {
  return text.split(HYPHENATED).map((part, index) =>
    index % 2 === 1 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: the parts never reorder
      <span className="whitespace-nowrap" key={index}>
        {part}
      </span>
    ) : (
      part
    )
  )
}
