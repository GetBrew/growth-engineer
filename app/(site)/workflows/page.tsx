import type { Metadata } from 'next'
import { WorkflowsIndex } from '@/components/catalog/workflows-index'
import { HeroBanner } from '@/components/common/hero-banner'
import { Page } from '@/components/layout/page'
import { JsonLd } from '@/components/seo/json-ld'
import { loadTagChips, loadWorkflowSearchItems } from '@/lib/catalog/loaders'
import { SITE_ORIGIN } from '@/lib/env'
import { pageMetadata } from '@/lib/seo/metadata'
import { collectionJsonLd, listingItems } from '@/lib/seo/structured-data'
import { hasCopyCounter, loadCopyStats } from '@/lib/usage/copies'

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

/**
 * Prerendered in full; the index narrows itself in the browser. The copy
 * counts are the one request-time read: handed over as a promise, they
 * order the Hot and Popular angles.
 */
export default function WorkflowsPage() {
  return (
    <>
      <HeroBanner isCompact title="Workflows that grow revenue" />
      <Page>
        <Index />
      </Page>
    </>
  )
}

function Index() {
  const [workflows, tags] = [loadWorkflowSearchItems(), loadTagChips()]
  return (
    <>
      <JsonLd
        data={collectionJsonLd(SITE_ORIGIN, PAGE, listingItems(workflows))}
      />
      <WorkflowsIndex
        stats={hasCopyCounter() ? loadCopyStats() : null}
        tags={tags.filter((tag) => tag.counts.workflows > 0)}
        workflows={workflows}
      />
    </>
  )
}
