import type { CSSProperties } from 'react'
import { EntityLogo } from '@/components/catalog/entity-logo'
import { MaskIcon } from '@/components/layout/mask-icon'
import { loadCompanies, loadWorkflows } from '@/lib/catalog/loaders'
import { githubAvatarUrl } from '@/lib/github'
import { cn } from '@/lib/utils/cn'
import styles from './contribution-marquee.module.css'

type Pill = {
  id: string
  href: string
  label: string
  /** The mark beside the label: a company logo, or a contributor's photo. */
  logoUrl?: string
  /** Its alt text, and its fallback letter when there is no mark. */
  name: string
  /** A workflow names the person who submitted it. */
  author?: string
  /** People get a circular mark; companies keep the rounded square. */
  round?: boolean
}

/** Rows run at different speeds and directions, so the wall never slides as one block. */
const ROWS = [
  { duration: '128s', reverse: false },
  { duration: '156s', reverse: true },
  { duration: '140s', reverse: false },
]

/**
 * The catalog, moving: workflows beside the company whose tool leads them, the
 * companies themselves, and the people who submitted them. Read from the tree,
 * so the wall grows with the catalog instead of being a fixed picture of it.
 */
export async function ContributionMarquee() {
  const [workflows, companies] = await Promise.all([
    loadWorkflows('featured', 30),
    loadCompanies(24, undefined, false),
  ])

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
        href: `https://github.com/${encodeURIComponent(login)}`,
        label: login,
        logoUrl: githubAvatarUrl(login),
        name: login,
        round: true,
      })
    ),
  ]

  // Interleaved, then dealt round-robin across the rows: left to themselves the
  // three kinds would clump, and a row would end up all companies.
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

/**
 * The row renders its pills TWICE and translates -50%: that is what makes the
 * loop seamless. The second copy is `aria-hidden`, so a screen reader hears
 * each contribution once.
 */
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

function PillChip({ pill }: { pill: Pill }) {
  const external = pill.href.startsWith('http')

  return (
    <a
      className="focus-ring flex items-center gap-2.5 whitespace-nowrap rounded-full border bg-background py-2 pr-5 pl-2 transition-colors duration-200 hover:bg-surface"
      href={pill.href}
      rel={external ? 'noreferrer' : undefined}
      target={external ? '_blank' : undefined}
    >
      {/* `border-0` because the pill is already a bordered shape, and grayscale
          because a dozen unrelated brand palettes read as noise. */}
      <EntityLogo
        className={cn(
          'shrink-0 border-0 bg-transparent grayscale',
          pill.round && 'rounded-full'
        )}
        logoUrl={pill.logoUrl}
        name={pill.name}
        size={30}
      />
      <span className="type-item text-foreground">{pill.label}</span>
      {pill.author ? (
        <span className="type-item flex shrink-0 items-center gap-1.5 text-faint">
          <MaskIcon size={15} src="/social/github.svg" />
          {pill.author}
        </span>
      ) : null}
    </a>
  )
}
