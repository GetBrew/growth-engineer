import Link from 'next/link'
import type { CSSProperties } from 'react'
import { EntityLogo } from '@/components/common/entity-logo'
import { MaskIcon } from '@/components/layout/mask-icon'
import { loadCompanies, loadWorkflows } from '@/lib/catalog/loaders'
import { githubAvatarUrl, githubProfileUrl } from '@/lib/github'
import { cn } from '@/lib/utils/cn'
import styles from './contribution-marquee.module.css'

type Pill = {
  id: string
  href: string
  label: string
  logoUrl?: string
  name: string
  author?: string
  round?: boolean
}

const ROWS = [
  { duration: '128s', reverse: false },
  { duration: '156s', reverse: true },
  { duration: '140s', reverse: false },
]

export function ContributionMarquee() {
  const [workflows, companies] = [
    loadWorkflows('featured', 30),
    loadCompanies(24),
  ]

  const kinds: Array<Array<Pill>> = [
    workflows.map(({ workflow, tools }) => ({
      id: `workflow:${workflow.key}`,
      href: `/workflows/${workflow.key}`,
      label: workflow.title,
      logoUrl: tools[0]?.logoUrl,
      name: tools[0]?.companyName ?? workflow.title,
      author: workflow.author,
    })),
    companies.map(({ company }) => ({
      id: `company:${company.key}`,
      href: `/companies/${company.key}`,
      label: company.name,
      logoUrl: company.logoUrl,
      name: company.name,
    })),
    [...new Set(workflows.map(({ workflow }) => workflow.author))].map(
      (login) => ({
        id: `person:${login}`,
        href: githubProfileUrl(login),
        label: login,
        logoUrl: githubAvatarUrl(login),
        name: login,
        round: true,
      })
    ),
  ]

  const mixed = interleave(kinds)

  return (
    <div className="flex flex-col gap-3">
      {ROWS.map((row, index) => (
        <MarqueeRow
          key={row.duration}
          pills={mixed.filter((_, at) => at % ROWS.length === index)}
          reverse={row.reverse}
          seconds={row.duration}
        />
      ))}
    </div>
  )
}

function interleave(lists: ReadonlyArray<ReadonlyArray<Pill>>): Array<Pill> {
  const longest = Math.max(...lists.map((list) => list.length))
  return Array.from({ length: longest }, (_, index) =>
    lists.flatMap((list) => list[index] ?? [])
  ).flat()
}

function MarqueeRow({
  pills,
  seconds,
  reverse,
}: {
  pills: ReadonlyArray<Pill>
  seconds: string
  reverse: boolean
}) {
  return (
    <div className={cn(styles.viewport, 'overflow-hidden')}>
      <div
        className={cn(styles.track, reverse && styles.reverse, 'flex w-max')}
        style={{ '--duration': seconds } as CSSProperties}
      >
        {[0, 1].map((copy) => (
          <ul
            aria-hidden={copy === 1 ? true : undefined}
            className="flex shrink-0 items-center gap-3 pr-3"
            // The second copy only fills the loop: no tab stops, no reading.
            inert={copy === 1}
            key={copy}
          >
            {pills.map((pill) => (
              <li key={pill.id}>
                <PillChip pill={pill} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

const PILL =
  'focus-ring flex h-10 items-center gap-2.5 whitespace-nowrap rounded-full border bg-background pr-5 pl-2 transition-colors duration-200 hover:bg-surface'

function PillChip({ pill }: { pill: Pill }) {
  const body = <PillBody pill={pill} />
  if (pill.href.startsWith('/')) {
    return (
      <Link className={PILL} href={pill.href}>
        {body}
      </Link>
    )
  }
  return (
    <a className={PILL} href={pill.href} rel="noreferrer" target="_blank">
      {body}
    </a>
  )
}

function PillBody({ pill }: { pill: Pill }) {
  return (
    <>
      <EntityLogo
        className={cn(
          'shrink-0 border-0 bg-transparent grayscale',
          pill.round && 'rounded-full'
        )}
        logoUrl={pill.logoUrl}
        name={pill.name}
        size={24}
      />
      <span className="type-control text-foreground">{pill.label}</span>
      {pill.author ? (
        <span className="type-control flex shrink-0 items-center gap-1.5 text-faint">
          <MaskIcon size={15} src="/social/github.svg" />
          {pill.author}
        </span>
      ) : null}
    </>
  )
}
