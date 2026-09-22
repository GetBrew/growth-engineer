import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { AgentMarquee } from '@/components/home/agent-marquee'
import { Definitions } from '@/components/home/definitions'
import { FounderProof } from '@/components/home/founder-proof'
import { HeroVisual } from '@/components/home/hero-visual'
import { HomeCatalog } from '@/components/home/home-catalog'
import { HomeSkeleton } from '@/components/skeletons/home-skeleton'
import { buttonVariants } from '@/components/ui/button'
import { SITE } from '@/lib/catalog/definitions'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = {
  ...pageMetadata({
    title: SITE.name,
    description: SITE.tagline,
    path: '/',
  }),
  // The root template would print the name twice.
  title: { absolute: `${SITE.name} — ${SITE.tagline}` },
}

export default function HomePage() {
  return (
    <>
      <section className="page-container pt-10 pb-6 sm:pt-14">
        <div className="flex flex-col items-start justify-between gap-8 pb-10 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <h1 className="type-display">
              Find the right growth tools.
              <span className="block">Put proven workflows to work.</span>
            </h1>
          </div>

          <div className="flex max-w-md flex-col items-start gap-5 lg:items-end lg:text-right">
            <p className="type-lead">
              Discover agent-ready tools and proven growth workflows. Copy one
              file and run it with your agent.
            </p>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Link
                className={buttonVariants({ size: 'pill' })}
                href="/workflows"
              >
                Browse workflows
              </Link>
              <Link
                className={buttonVariants({
                  variant: 'outline',
                  size: 'pill',
                })}
                href="/tools"
              >
                Explore tools
              </Link>
            </div>
          </div>
        </div>

        <HeroVisual />
        <AgentMarquee />
      </section>

      <Suspense fallback={<HomeSkeleton />}>
        <HomeCatalog />
      </Suspense>
      <Definitions />
      <FounderProof />
    </>
  )
}
