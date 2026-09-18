import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { BrandMark, PoweredByBrew } from './brand'

const COLUMNS = [
  {
    heading: 'Catalog',
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
    heading: 'Contribute',
    links: [
      ['Submit a workflow', '/submit'],
      ['List your company', 'mailto:founders@brew.new'],
      ['Report an issue', 'mailto:founders@brew.new'],
    ],
  },
  {
    heading: 'Brew',
    links: [
      ['brew.new', 'https://brew.new'],
      ['X', 'https://x.com/brewdotnew'],
      ['LinkedIn', 'https://www.linkedin.com/company/brewdotnew'],
    ],
  },
] as const

// Evaluated once, at module load — never inside a render, where the
// prerenderer treats `new Date()` as request-time data and refuses the shell.
const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="overflow-hidden border-border border-t bg-[#fafafa]">
      <div className="mx-auto max-w-6xl px-5 pt-14 pb-10 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <div className="flex max-w-sm flex-col gap-6">
            <div className="flex flex-col gap-2">
              <BrandMark />
              <PoweredByBrew />
            </div>
            <p className="text-foreground/62 text-sm leading-6">
              Companies, the tools they make, and workflows that put tools to
              work. Every tool and workflow is one markdown file any agent can
              run.
            </p>
            <a
              className="focus-ring inline-flex h-10 w-fit items-center gap-2 rounded-full bg-foreground px-4 font-medium text-background text-sm transition-colors hover:bg-black/80"
              href="mailto:founders@brew.new"
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              Talk to the founders
            </a>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <p className="font-medium text-[10px] text-foreground/55 uppercase tracking-[0.12em]">
                  {column.heading}
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map(([label, href]) => (
                    <li key={label}>
                      {href.startsWith('http') || href.startsWith('mailto:') ? (
                        <a
                          className="text-[13px] text-foreground/70 transition-colors hover:text-foreground"
                          href={href}
                          rel={
                            href.startsWith('http') ? 'noreferrer' : undefined
                          }
                          target={
                            href.startsWith('http') ? '_blank' : undefined
                          }
                        >
                          {label}
                        </a>
                      ) : (
                        <Link
                          className="text-[13px] text-foreground/70 transition-colors hover:text-foreground"
                          href={href}
                        >
                          {label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-border border-t pt-6 text-foreground/55 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {YEAR} growth.engineer · Powered by Brew.</p>
          <p>
            Reads are open to every agent. Copy a file; that is the whole setup.
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="footer-wordmark -mb-[0.02em] w-full select-none whitespace-nowrap px-2 text-center font-semibold text-[15vw] text-transparent leading-[0.82] tracking-[-0.055em]"
      >
        growth.engineer
      </div>
    </footer>
  )
}
