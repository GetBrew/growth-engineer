import { AgentMarquee } from '@/components/home/agent-marquee'
import { McpCard } from '@/components/home/mcp-card'
import { PeopleMarquee } from '@/components/home/people-marquee'
import { MCP_PATH } from '@/lib/catalog/definitions'
import { SITE_ORIGIN } from '@/lib/env'
import styles from './hero-banner.module.css'

/**
 * The home page's opening: its promise, the avatars, the MCP card and the
 * agents. The listings have no banner; each opens on its own heading.
 */
export function HeroBanner({
  lines,
}: {
  /** The headline, one entry per line: each breaks where it is written. */
  lines: ReadonlyArray<string>
}) {
  return (
    <section className="page-container pt-10 pb-6 sm:pt-14">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          <div className="flex flex-col">
            <h1 className="type-display">
              {lines.map((line, index) => (
                // A space between lines, so the heading reads as one
                // sentence to screen readers and in the page's text.
                <span className="sm:block" key={line}>
                  {index > 0 ? ' ' : null}
                  {line}
                </span>
              ))}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <PeopleMarquee />
            {/* A greeting, then one line on what this is; a phone gets a
                shorter one, so it still fits beside the avatars. */}
            <div className="flex flex-col gap-0.5">
              <p className="type-control flex items-center gap-1.5 text-foreground">
                Welcome
                <span aria-hidden="true" className={styles.wave}>
                  👋
                </span>
              </p>
              <p className="type-label text-soft">
                <span className="sm:hidden">
                  Growth workflows for any agent.
                </span>
                <span className="max-sm:hidden">
                  Open-source growth workflows. Works with any agent.
                </span>
              </p>
            </div>
          </div>
        </div>

        <McpCard url={`${SITE_ORIGIN}${MCP_PATH}`} />
      </div>

      <AgentMarquee />
    </section>
  )
}
