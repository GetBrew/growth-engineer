import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { EntityLogo } from '@/components/common/entity-logo'

/** One folded-away entry: what the row names it by, and its logo. */
export type FoldedEntry = {
  key: string
  name: string
  logo: { name: string; logoUrl?: string }
}

/**
 * The last slot of a folded listing, drawn as one more row: stacked logos
 * where a row has its logo, "N more tools" where it has its title, the first
 * names where it has its description. It sits in the same grid or list as
 * the rows, so a category reads as full rows rather than rows plus a footer.
 * Tools and companies fold; the workflows list is always shown in full.
 */
export function SeeMoreRow({
  href,
  hidden,
  noun,
}: {
  href: string
  hidden: ReadonlyArray<FoldedEntry>
  /** Plural, lowercase: "tools", "companies". */
  noun: string
}) {
  return (
    <Link
      className="focus-ring group/more -mx-3 flex items-center gap-4 rounded-xl px-3 py-4 transition-colors hover:bg-hover"
      href={href}
    >
      <span className="flex w-11 shrink-0 items-center justify-center [&>*+*]:-ml-2">
        {hidden.slice(0, 3).map((entry) => (
          <EntityLogo
            className="rounded-md ring-2 ring-background"
            key={entry.key}
            logoUrl={entry.logo.logoUrl}
            name={entry.logo.name}
            size={20}
          />
        ))}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="type-item">
          {hidden.length} more {noun}
        </span>
        <span className="type-body truncate">
          {namesLine(hidden.map((entry) => entry.name))}
        </span>
      </span>
      <span className="grid size-7 shrink-0 place-items-center text-soft transition-colors duration-300 group-hover/more:text-foreground">
        <HugeiconsIcon
          aria-hidden="true"
          className="transition-transform group-hover/more:translate-x-0.5"
          icon={ArrowRight02Icon}
          size={14}
          strokeWidth={2}
        />
      </span>
    </Link>
  )
}

/** "Apollo", "Apollo and Clay", "Apollo, Clay, and more". */
function namesLine(names: ReadonlyArray<string>): string {
  const [first, second] = names
  if (names.length === 1) {
    return `${first}`
  }
  if (names.length === 2) {
    return `${first} and ${second}`
  }
  return `${first}, ${second}, and more`
}
