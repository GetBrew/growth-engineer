import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { HeroBanner } from '@/components/catalog/hero-banner'
import { Page } from '@/components/catalog/primitives'
import { HeroActions } from '@/components/catalog/works-with-agents'
import { WorkflowsSkeleton } from '@/components/skeletons/workflows-skeleton'
import { buttonVariants } from '@/components/ui/button'
import { WorkflowsIndex } from '@/components/workflows/workflows-index'
import { loadTagChips, loadWorkflowSearchItems } from '@/lib/catalog/loaders'

export const metadata: Metadata = {
  title: 'Workflows',
  description:
    'Growth workflows across tools, each one a markdown file any agent can run.',
}

/** Prerendered in full; the index narrows itself in the browser. */
export default function WorkflowsPage() {
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
          <Index />
        </Suspense>
      </Page>
    </>
  )
}

async function Index() {
  const [workflows, tags] = await Promise.all([
    loadWorkflowSearchItems(),
    loadTagChips(),
  ])
  return (
    <WorkflowsIndex
      tags={tags.filter((tag) => tag.counts.workflows > 0)}
      workflows={workflows}
    />
  )
}
