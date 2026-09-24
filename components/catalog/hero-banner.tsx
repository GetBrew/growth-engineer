import { AgentMarquee } from '@/components/home/agent-marquee'
import { McpCard } from '@/components/home/mcp-card'
import { PeopleMarquee } from '@/components/home/people-marquee'

/**
 * The head of every page that opens the catalog — the home page and the three
 * listings. One component, so they cannot drift: a page passes its words and
 * nothing else. The people, the CLI card and the agent band are the same on
 * all four, because they say the same thing on all four.
 */
export function HeroBanner({ title }: { title: string }) {
  return (
    <section className="page-container pt-10 pb-6 sm:pt-14">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          <div className="flex flex-col">
            {/* The measure, not a <br>, is what puts a heading on two lines: at
                17ch a title of ~30 characters wraps once at every width, and
                nothing is forced if a device disagrees. */}
            <h1 className="type-display max-w-[17ch] text-balance">{title}</h1>
          </div>

          <PeopleMarquee />
        </div>

        <McpCard />
      </div>

      <AgentMarquee />
    </section>
  )
}
