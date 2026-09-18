import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { Page } from '@/components/catalog/primitives'
import { WorkflowRowsSkeleton } from '@/components/catalog/skeletons'
import {
  WorkflowsIndex,
  type WorkflowsSearchParams,
} from '@/components/catalog/workflows-index'
import { GradientVideo } from '@/components/marketing/gradient-video'

export const metadata: Metadata = {
  title: 'Workflows',
  description:
    'Growth workflows across tools, each one a markdown file any agent can run.',
}

const HERO_LOGOS = [
  ['Slack', '/logos/slack.jpg'],
  ['Notion', '/logos/notion.png'],
  ['GitHub', '/logos/github.png'],
  ['Canva', '/logos/canva.jpg'],
] as const

/**
 * The static hero prerenders; the list — which reads the URL — streams in
 * behind Suspense. The `searchParams` promise is handed down unresolved so the
 * page itself stays synchronous.
 */
export default function WorkflowsPage({
  searchParams,
}: {
  searchParams: WorkflowsSearchParams
}) {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="relative isolate flex min-h-[360px] items-center justify-center overflow-hidden rounded-[22px] bg-[#d98243] px-6 text-center sm:rounded-[28px] lg:min-h-[320px]">
          <GradientVideo />
          <div className="pointer-events-none relative z-10 flex flex-col items-center">
            <h1 className="max-w-[20ch] text-balance font-semibold text-[30px] text-white leading-[1.05] tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              Find the workflow behind your next growth move
            </h1>
            <div className="pointer-events-auto mt-6 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
              <div className="flex -space-x-2">
                {HERO_LOGOS.map(([name, src]) => (
                  <span
                    className="grid size-9 place-items-center rounded-full border border-border bg-white p-1.5 ring-2 ring-white"
                    key={name}
                  >
                    <Image
                      alt={name}
                      className="size-full object-contain"
                      height={24}
                      src={src}
                      width={24}
                    />
                  </span>
                ))}
              </div>
              <Link
                className="focus-ring flex h-10 items-center gap-1.5 rounded-full bg-white px-4 font-medium text-foreground text-sm transition-colors hover:bg-white/90"
                href="/submit"
              >
                <Plus aria-hidden="true" className="size-4" />
                Submit a workflow
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Page>
        <Suspense fallback={<WorkflowRowsSkeleton />}>
          <WorkflowsIndex searchParams={searchParams} />
        </Suspense>
      </Page>
    </>
  )
}
