import type { ReactNode } from 'react'
import { AgentMarquee } from '@/components/home/agent-marquee'
import { McpCard } from '@/components/home/mcp-card'
import { PeopleMarquee } from '@/components/home/people-marquee'
import { MCP_PATH } from '@/lib/catalog/definitions'
import { SITE_ORIGIN } from '@/lib/env'

/**
 * The page's opening. The home page gets the full banner — its promise, the
 * welcome, the MCP card and the agents; a listing gets its title alone, so
 * the list starts on the first screen.
 */
export function HeroBanner({
  title,
  lede,
  isCompact = false,
}: {
  title: string
  /** Under the title, on the full banner: how to use the site. */
  lede?: ReactNode
  isCompact?: boolean
}) {
  if (isCompact) {
    return (
      <section className="page-container pt-10 sm:pt-14">
        <h1 className="type-display max-w-[20ch] text-balance">{title}</h1>
      </section>
    )
  }
  return (
    <section className="page-container pt-10 pb-6 sm:pt-14">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          <div className="flex flex-col gap-5">
            <h1 className="type-display max-w-[17ch] text-balance">{title}</h1>
            {lede}
          </div>

          <PeopleMarquee />
        </div>

        <McpCard url={`${SITE_ORIGIN}${MCP_PATH}`} />
      </div>

      <AgentMarquee />
    </section>
  )
}
