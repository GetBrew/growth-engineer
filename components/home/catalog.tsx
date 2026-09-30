import { WorkflowsIndex } from '@/components/catalog/workflows-index'
import { CatalogShell } from '@/components/home/catalog-shell'
import { JsonLd } from '@/components/seo/json-ld'
import { loadTagChips, loadWorkflowSearchItems } from '@/lib/catalog/loaders'
import { SITE_ORIGIN } from '@/lib/env'
import { collectionJsonLd, listingItems } from '@/lib/seo/structured-data'
import { hasCopyCounter, loadCopyStats } from '@/lib/usage/copies'

export function HomeCatalog() {
  const [workflows, tags] = [loadWorkflowSearchItems(), loadTagChips()]
  return (
    <CatalogShell>
      <JsonLd
        data={collectionJsonLd(
          SITE_ORIGIN,
          {
            path: '/',
            name: 'Workflows',
            description:
              'Growth workflows across tools, each one a markdown file any agent can run.',
          },
          listingItems(workflows)
        )}
      />
      <WorkflowsIndex
        stats={hasCopyCounter() ? loadCopyStats() : null}
        tags={tags}
        workflows={workflows}
      />
    </CatalogShell>
  )
}
