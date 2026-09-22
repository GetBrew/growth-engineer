import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { HeroBanner } from '@/components/catalog/hero-banner'
import { Page } from '@/components/catalog/primitives'
import { HeroActions } from '@/components/catalog/works-with-agents'
import { WorkflowsSkeleton } from '@/components/skeletons/workflows-skeleton'
import { buttonVariants } from '@/components/ui/button'
import {
  WorkflowsIndex,
  type WorkflowsSearchParams,
} from '@/components/workflows/workflows-index'

export const metadata: Metadata = {
  title: 'Workflows',
  description:
    'Growth workflows across tools, each one a markdown file any agent can run.',
}

export default function WorkflowsPage({
  searchParams,
}: {
  searchParams: WorkflowsSearchParams
}) {
  return (
    <>
      <HeroBanner
        description="Agent-ready playbooks you can copy, customize, and run."
        eyebrow="Workflows"
        icon="/workflow.svg"
        title="Workflows that grow revenue"
      >
        <HeroActions>
          <Link className={buttonVariants({ size: 'pill' })} href="/submit">
            Submit a workflow
          </Link>
        </HeroActions>
      </HeroBanner>
      <Page>
        <Suspense fallback={<WorkflowsSkeleton />}>
          <WorkflowsIndex searchParams={searchParams} />
        </Suspense>
      </Page>
    </>
  )
}
