import Image from 'next/image'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { BrandLockup } from './brand'

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
      // Not `?agent=native`: agent level comes from CHECKED facts, and every
      // tool is `unverified` until someone checks, so that filter is empty
      // until verification starts. Linking to it advertises an empty page.
      ['Agent readiness', '/tools'],
    ],
  },
  {
    heading: 'Company',
    links: [
      ['Submit a workflow', '/submit'],
      ['List your company', 'mailto:founders@brew.new'],
      ['brew.new', 'https://brew.new'],
      ['LinkedIn', 'https://www.linkedin.com/company/brewdotnew'],
    ],
  },
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
      <div className="page-container pt-12 pb-6 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.25fr)] lg:gap-16">
          <div className="flex max-w-xl flex-col items-start gap-6">
            <BrandLockup />
            <p className="type-body max-w-sm text-soft">
              A catalog of companies, the tools they make, and workflows that
              put tools to work. Every tool and workflow is one markdown file
              any agent can run.
            </p>
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

        <Separator className="my-10 border-t border-dashed bg-transparent" />

        <div className="type-label flex flex-col gap-3 text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {YEAR} growth.engineer</p>
          <p className="flex items-center gap-1.5">
            Brought to you by
            <a
              className="focus-ring relative block h-4 w-12 rounded-sm"
              href="https://brew.new"
              rel="noreferrer"
              target="_blank"
            >
              <Image
                alt="Brew"
                className="object-contain object-left"
                fill
                sizes="48px"
                src="/logos/brew.svg"
              />
            </a>
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mb-[-0.04em] select-none whitespace-nowrap px-2 text-center font-semibold text-[15vw] text-foreground leading-[0.78] tracking-[-0.055em]"
      >
        growth.engineer
      </div>
    </footer>
  )
}
