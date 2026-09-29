import { FavouriteIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { SITE } from '@/lib/catalog/definitions'
import { GUIDES, guidePath } from '@/lib/constants/guides'
import { SECTIONS } from '@/lib/constants/sections'
import { BrandLockup } from './brand'
import { BrewLink } from './brew-link'
import styles from './footer.module.css'

// Three columns of equal weight. Explore holds every listing; Contribute
// points at the guide for each kind of file (each guide links on to its
// README on GitHub).
const COLUMNS = [
  {
    heading: 'Explore',
    links: SECTIONS.map((section) => [section.label, section.href] as const),
  },
  {
    heading: 'Contribute',
    links: GUIDES.map((guide) => [guide.title, guidePath(guide)] as const),
  },
  {
    heading: 'Brew',
    links: [
      ['brew.new', SITE.publisher.url],
      ...SITE.publisher.profiles.map(
        (profile) => [profile.label, profile.url] as const
      ),
    ],
  },
] as const

// Three little hearts above the big one, graduated so they read as a group
// rather than a row: the red one leads, the other two step down behind it.
// The colours are borrowed for their hue, not their meaning: these are
// confetti, and a hardcoded hex would be the only colour outside the tokens.
// Black is not among them — it would repeat the big heart they sit above.
const SPARKS = [
  {
    id: 'a',
    x: '-11px',
    y: '0px',
    size: 9,
    delay: '90ms',
    colour: 'var(--company)',
  },
  {
    id: 'b',
    x: '0px',
    y: '-9px',
    size: 12,
    delay: '0ms',
    colour: 'var(--heart)',
  },
  {
    id: 'c',
    x: '11px',
    y: '1px',
    size: 7,
    delay: '180ms',
    colour: 'var(--tool)',
  },
] as const

// Fixed at build by next.config.ts. `new Date()` here would run again when a
// page with a copy-count hole renders on request, and after New Year it would
// disagree with the prerendered HTML.
const YEAR = process.env.BUILD_YEAR
const LINK =
  'type-label rounded-sm text-soft transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground'

/** A page on this site, or another site in a new tab. */
function FooterLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith('/')) {
    return (
      <Link className={LINK} href={href}>
        {label}
      </Link>
    )
  }

  return (
    <a className={LINK} href={href} rel="noreferrer" target="_blank">
      {label}
    </a>
  )
}

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-dashed bg-background">
      <div className="page-container pt-(--space-section) pb-10 sm:pb-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(20rem,0.75fr)_minmax(0,1.3fr)] lg:gap-16">
          <div className="flex max-w-xl flex-col items-start gap-6">
            <div className="flex flex-col gap-3">
              <BrandLockup />
              <p className="type-body max-w-sm text-balance text-soft">
                {SITE.tagline}
              </p>
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3"
          >
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <p className="eyebrow">{column.heading}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map(([label, href]) => (
                    <li key={label}>
                      <FooterLink href={href} label={label} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-label text-faint">© {YEAR} growth.engineer</p>

          {/* Three pieces, not five: "by the … team" wrapped the wordmark in
              words on both sides, and a logo mid-sentence reads as a gap. The
              mark ends the line, which is how a credit normally runs. */}
          <p
            className={`${styles.group} type-label flex items-center gap-1.5 text-faint`}
          >
            Built with
            <span className={`${styles.heart} text-foreground`}>
              <HugeiconsIcon
                aria-label="love"
                className={`${styles.mark} fill-current`}
                icon={FavouriteIcon}
                size={14}
              />
              {SPARKS.map((spark) => (
                <span
                  className={styles.spark}
                  key={spark.id}
                  style={
                    {
                      '--x': spark.x,
                      '--y': spark.y,
                      animationDelay: spark.delay,
                      color: spark.colour,
                    } as CSSProperties
                  }
                >
                  <HugeiconsIcon
                    aria-hidden="true"
                    className="fill-current"
                    icon={FavouriteIcon}
                    size={spark.size}
                  />
                </span>
              ))}
            </span>
            by
            {/* The wordmark ships at h-4, which paints 1.58x the 12px text
                beside it and overhangs it top and bottom. h-3 brings its ink
                to about 1.2x, which reads as a logo rather than a shout. */}
            <BrewLink className="h-3 w-9" />
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mb-[-0.04em] select-none whitespace-nowrap px-2 text-center font-medium text-[13.5vw] text-foreground/[0.07] leading-[0.78] tracking-[-0.055em]"
      >
        growth.engineer
      </div>
    </footer>
  )
}
