import { BookOpen01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import { CatalogList, type CatalogListItem } from '@/components/catalog/list'
import { Page } from '@/components/layout/page'
import { JsonLd } from '@/components/seo/json-ld'
import { GUIDES, guidePath } from '@/lib/constants/guides'
import { SITE_ORIGIN } from '@/lib/env'
import { pageMetadata } from '@/lib/seo/metadata'
import { collectionJsonLd } from '@/lib/seo/structured-data'

const PAGE = {
  path: '/docs',
  name: 'Docs',
  description: 'How to add your company, tools and workflows to the catalog.',
}

export const metadata: Metadata = pageMetadata({
  title: PAGE.name,
  description: PAGE.description,
  path: PAGE.path,
})

/**
 * Each guide is drawn as a catalog row — the same row a workflow gets on
 * `/workflows`, with the kind's own icon in the leading slot. `companies: []`
 * is what selects that layout; there are no company marks to show on a guide,
 * so the trailing slot stays empty.
 */
const ITEMS: ReadonlyArray<CatalogListItem> = GUIDES.map((guide) => ({
  id: guide.id,
  href: guidePath(guide),
  title: guide.title,
  logo: { name: guide.title },
  description: guide.summary,
  companies: [],
  entity: guide.entity,
}))

/** The guides, by section, in reading order. */
export default function DocsPage() {
  return (
    <Page className="flex flex-col gap-(--space-block)">
      <JsonLd
        data={collectionJsonLd(
          SITE_ORIGIN,
          PAGE,
          ITEMS.map((item) => ({ name: item.title, path: item.href }))
        )}
      />
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full border bg-background text-soft">
          <HugeiconsIcon
            aria-hidden="true"
            icon={BookOpen01Icon}
            size={19}
            strokeWidth={1.8}
          />
        </span>
        <h1 className="type-page-title">Docs</h1>
      </div>

      <section className="flex flex-col gap-(--space-sm)">
        <h2 className="type-category">Contribute</h2>
        <CatalogList items={ITEMS} />
      </section>
    </Page>
  )
}
