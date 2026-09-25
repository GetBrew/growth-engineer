import type { Metadata } from 'next'
import { Suspense } from 'react'
import { WorkflowsIndex } from '@/components/catalog/workflows-index'
import { HeroBanner } from '@/components/common/hero-banner'
import { Page } from '@/components/layout/page'
import { WorkflowsSkeleton } from '@/components/skeletons/workflows-skeleton'
import { loadTagChips, loadWorkflowSearchItems } from '@/lib/catalog/loaders'

export const metadata: Metadata = {
  title: 'Workflows',
  description:
    'Growth workflows across tools, each one a markdown file any agent can run.',
}

export default function WorkflowsPage() {
  return (
    <>
      <HeroBanner title="Workflows that grow revenue" />
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
