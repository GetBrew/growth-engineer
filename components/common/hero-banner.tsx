import { AgentMarquee } from '@/components/home/agent-marquee'
import { McpCard } from '@/components/home/mcp-card'
import { PeopleMarquee } from '@/components/home/people-marquee'
import { MCP_PATH } from '@/lib/catalog/definitions'
import { SITE_ORIGIN } from '@/lib/env'

export function HeroBanner({ title }: { title: string }) {
  return (
    <section className="page-container pt-10 pb-6 sm:pt-14">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          <div className="flex flex-col">
            <h1 className="type-display max-w-[17ch] text-balance">{title}</h1>
          </div>

          <PeopleMarquee />
        </div>

        <McpCard url={`${SITE_ORIGIN}${MCP_PATH}`} />
      </div>

      <AgentMarquee />
    </section>
  )
}
