import { BookOpen01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import { CatalogList, type CatalogListItem } from '@/components/catalog/list'
import { Page } from '@/components/layout/page'
import { GUIDES } from '@/lib/constants/guides'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: 'Learn',
  description:
    'How growth.engineer works, and how to add your company, tools and workflows.',
  path: '/contribute',
})

/**
 * Each guide is drawn as a catalog row — the same row a workflow gets on
 * `/workflows`, with the kind's own icon in the leading slot. `companies: []`
 * is what selects that layout; there are no company marks to show on a guide,
 * so the trailing slot stays empty.
 */
const ITEMS: ReadonlyArray<CatalogListItem> = GUIDES.map((guide) => ({
  id: guide.id,
  href: `/contribute/${guide.id}`,
  title: guide.title,
  logo: { name: guide.title },
  description: guide.summary,
  companies: [],
  entity: guide.entity,
}))

export default function ContributePage() {
  return (
    <Page className="flex flex-col gap-(--space-block)">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full border bg-background text-soft">
          <HugeiconsIcon
            aria-hidden="true"
            icon={BookOpen01Icon}
            size={19}
            strokeWidth={1.8}
          />
        </span>
        <h1 className="type-page-title">Learn</h1>
      </div>

      <CatalogList items={ITEMS} />
    </Page>
  )
}
