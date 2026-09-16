import { ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { ToolCard, WorkflowRow } from '@/components/catalog/cards'
import {
  EmptyState,
  Page,
  SectionHeading,
} from '@/components/catalog/primitives'
import {
  ToolCardsSkeleton,
  WorkflowRowsSkeleton,
} from '@/components/catalog/skeletons'
import { ThinkingOrb } from '@/components/marketing/thinking-orb'
import { PoweredByBrew } from '@/components/site/brand'
import { buttonVariants } from '@/components/ui/button'
import { loadNewTools, loadWorkflows } from '@/lib/catalog/loaders'
import { cn } from '@/lib/utils/cn'

/**
 * Home: the pitch, then what is moving. The hero is fully static and
 * prerenders; the two lists read Convex at request time behind Suspense, so
 * the build never contacts the backend and the shell is instant.
 */
export default function HomePage() {
  return (
    <>
      <section className="flex flex-col items-center px-6 pt-20 pb-16 text-center sm:pt-28">
        <ThinkingOrb label="growth.engineer" size={64} state="shaping" />
        <h1 className="mt-10 max-w-[18ch] text-balance font-semibold text-4xl tracking-[-0.04em] sm:text-6xl">
          The tools and workflows behind your next growth move
        </h1>
        <p className="mt-5 max-w-xl text-balance text-foreground/65 text-lg leading-7">
          Companies, the tools they make, and workflows that put tools to work.
          Every tool and workflow is one markdown file any agent can run —
          copying it is the whole setup.
        </p>

        <form
          action="/tools"
          className="relative mt-8 w-full max-w-xl"
          method="get"
        >
          <label className="relative block">
            <span className="sr-only">Search tools</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-foreground/45"
            />
            <input
              autoComplete="off"
              className="focus-ring h-14 w-full rounded-full border border-border bg-white pr-32 pl-13 text-base shadow-[0_10px_40px_rgb(0_0_0/0.06)] placeholder:text-foreground/40"
              name="q"
              placeholder="enrich contacts has:mcp agent:native"
              type="search"
            />
          </label>
          <button
            className="focus-ring absolute top-2 right-2 flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 font-medium text-background text-sm hover:bg-black/80"
            type="submit"
          >
            Search
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'rounded-full'
            )}
            href="/workflows"
          >
            Browse workflows
          </Link>
          <Link
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'rounded-full'
            )}
            href="/hacks"
          >
            Growth hacks
          </Link>
          <Link
            className={cn(buttonVariants({ variant: 'ghost' }), 'rounded-full')}
            href="/llms.txt"
          >
            For agents: llms.txt
          </Link>
        </div>
        <PoweredByBrew className="mt-8" />
      </section>

      <Page className="flex flex-col gap-16 pt-4">
        <section className="flex flex-col gap-6">
          <SectionHeading
            action={
              <Link
                className="text-foreground/60 text-sm hover:text-foreground"
                href="/workflows"
              >
                All workflows →
              </Link>
            }
            description="Copies and agent fetches over the last week."
            eyebrow="Trending"
            title="Workflows"
          />
          <Suspense fallback={<WorkflowRowsSkeleton rows={5} />}>
            <TrendingWorkflows />
          </Suspense>
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeading
            action={
              <Link
                className="text-foreground/60 text-sm hover:text-foreground"
                href="/tools"
              >
                All tools →
              </Link>
            }
            description="Each one lists every way an agent can reach it."
            eyebrow="New"
            title="Tools"
          />
          <Suspense fallback={<ToolCardsSkeleton cards={6} />}>
            <NewTools />
          </Suspense>
        </section>
      </Page>
    </>
  )
}

async function TrendingWorkflows() {
  await connection()
  const rows = await loadWorkflows('trending', undefined, 5)
  if (rows.length === 0) {
    return (
      <EmptyState
        hint="Run the seed, or publish the first one."
        title="No workflows yet"
      />
    )
  }
  return (
    <div className="flex flex-col border-border border-t">
      {rows.map((row) => (
        <WorkflowRow key={row.workflow._id} {...row} />
      ))}
    </div>
  )
}

async function NewTools() {
  await connection()
  const cards = await loadNewTools(6)
  if (cards.length === 0) {
    return <EmptyState title="No tools yet" />
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <ToolCard key={card.tool._id} {...card} />
      ))}
    </div>
  )
}
