import { FavouriteIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { BrandLockup } from './brand'
import { BrewLink } from './brew-link'
import styles from './footer.module.css'
import { NewsletterForm } from './newsletter-form'

const COLUMNS = [
  {
    heading: 'Explore',
    links: [
      ['Workflows', '/workflows'],
      ['Tools', '/tools'],
      ['Companies', '/companies'],
    ],
  },
  {
    heading: 'For agents',
    links: [
      ['llms.txt', '/llms.txt'],
      ['Tool files', '/tools'],
      ['Workflow files', '/workflows'],
    ],
  },
  {
    heading: 'Company',
    links: [
      ['Source on GitHub', 'https://github.com/GetBrew/growth-engineer'],
      ['brew.new', 'https://brew.new'],
      ['LinkedIn', 'https://www.linkedin.com/company/brewdotnew'],
    ],
  },
] as const

/** Where each spark flies, and when. `red` picks the heart colour. */
const SPARKS = [
  { id: 'a', x: '-520%', y: '-560%', delay: '0ms', red: false },
  { id: 'b', x: '-60%', y: '-760%', delay: '110ms', red: true },
  { id: 'c', x: '420%', y: '-600%', delay: '220ms', red: false },
  { id: 'd', x: '-700%', y: '-60%', delay: '160ms', red: true },
  { id: 'e', x: '640%', y: '-80%', delay: '60ms', red: false },
  { id: 'f', x: '160%', y: '-820%', delay: '300ms', red: false },
] as const

const YEAR = new Date().getFullYear()
const LINK =
  'type-label rounded-sm text-soft transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground'

function FooterLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith('/')) {
    return (
      <Link className={LINK} href={href}>
        {label}
      </Link>
    )
  }

  const isExternal = href.startsWith('http')
  return (
    <a
      className={LINK}
      href={href}
      rel={isExternal ? 'noreferrer' : undefined}
      target={isExternal ? '_blank' : undefined}
    >
      {label}
    </a>
  )
}

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-dashed bg-background">
      <div className="page-container pt-(--space-section) pb-10 sm:pb-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.25fr)] lg:gap-16">
          <div className="flex max-w-xl flex-col items-start gap-6">
            <BrandLockup />
            <NewsletterForm />
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

          <p
            className={`${styles.group} type-label flex items-center gap-1.5 text-faint`}
          >
            Built with
            <span className={`${styles.heart} text-heart`}>
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
                      color: spark.red ? 'var(--heart)' : 'var(--foreground)',
                    } as CSSProperties
                  }
                />
              ))}
            </span>
            by the
            <BrewLink />
            team
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
