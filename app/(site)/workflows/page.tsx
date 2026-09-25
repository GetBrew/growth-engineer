import type { Metadata } from 'next'
import { Suspense } from 'react'
import { WorkflowsIndex } from '@/components/catalog/workflows-index'
import { HeroBanner } from '@/components/common/hero-banner'
import { Page } from '@/components/layout/page'
import { JsonLd } from '@/components/seo/json-ld'
import { WorkflowsSkeleton } from '@/components/skeletons/workflows-skeleton'
import { loadTagChips, loadWorkflowSearchItems } from '@/lib/catalog/loaders'
import { SITE_ORIGIN } from '@/lib/env'
import { pageMetadata } from '@/lib/seo/metadata'
import { collectionJsonLd, listingItems } from '@/lib/seo/structured-data'

const PAGE = {
  path: '/workflows',
  name: 'Workflows',
  description:
    'Growth workflows across tools, each one a markdown file any agent can run.',
}

export const metadata: Metadata = pageMetadata({
  title: PAGE.name,
  description: PAGE.description,
  path: PAGE.path,
})

/** Prerendered in full; the index narrows itself in the browser. */
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
    <>
      <JsonLd
        data={collectionJsonLd(SITE_ORIGIN, PAGE, listingItems(workflows))}
      />
      <WorkflowsIndex
        tags={tags.filter((tag) => tag.counts.workflows > 0)}
        workflows={workflows}
      />
    </>
  )
}
