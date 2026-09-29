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
                <AvatarImage alt={avatar.name} src={avatar.src} />
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
  meta,
}: {
  byline: ReactNode
  title: string
  description?: string
  /** Beside the title from lg. A page with a side column (a workflow's) keeps
      them there instead, and its title and summary take the full width. */
  actions?: ReactNode
  tags?: ReadonlyArray<DetailTag>
  /** A quiet line under the description, like "Updated Sep 27, 2026". */
  meta?: string
}) {
  const hasTags = tags.length > 0

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
            <h1 className="type-page-title text-balance">
              <UnbrokenHyphens text={title} />
            </h1>
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
            {/* With a pills row, the date joins it instead (below). */}
            {meta && !hasTags ? (
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

/**
 * A browser may break a line right after a hyphen, and a balanced title
 * often takes it: "Spot and recover at-" / "risk customer accounts". Each
 * hyphenated word is kept whole, so lines only break between words.
 */
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
