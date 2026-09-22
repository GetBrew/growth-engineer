import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HeroBanner } from '@/components/catalog/hero-banner'
import { Page } from '@/components/catalog/primitives'
import { HeroActions } from '@/components/catalog/works-with-agents'
import { JsonLd } from '@/components/seo/json-ld'
import { WorkflowsSkeleton } from '@/components/skeletons/workflows-skeleton'
import { buttonVariants } from '@/components/ui/button'
import { WorkflowsIndex } from '@/components/workflows/workflows-index'
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
      <HeroBanner
        description="Agent-ready playbooks you can copy, customize, and run."
        eyebrow="Workflows"
        icon="/workflow.svg"
        title="Workflows that grow revenue"
      >
        <HeroActions>
          <a
            className={buttonVariants({ size: 'pill' })}
            href="https://github.com/GetBrew/growth-engineer/blob/main/CONTRIBUTING.md"
            rel="noreferrer"
            target="_blank"
          >
            Add a workflow
          </a>
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
