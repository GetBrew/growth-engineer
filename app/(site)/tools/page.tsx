import type { Metadata } from 'next'
import { ToolsExplorer } from '@/components/catalog/tools-explorer'
import { HeroBanner } from '@/components/common/hero-banner'
import { Page } from '@/components/layout/page'
import { JsonLd } from '@/components/seo/json-ld'
import { loadTagChips, loadToolSearchItems } from '@/lib/catalog/loaders'
import { SITE_ORIGIN } from '@/lib/env'
import { pageMetadata } from '@/lib/seo/metadata'
import { collectionJsonLd, listingItems } from '@/lib/seo/structured-data'

const PAGE = {
  path: '/tools',
  name: 'Tools',
  description:
    'Every tool an agent can reach over MCP, CLI or API, with the file to set it up.',
}

export const metadata: Metadata = pageMetadata({
  title: PAGE.name,
  description: PAGE.description,
  path: PAGE.path,
})

/**
 * One box searches everything: words go to the search text, chips like
 * `has:mcp` filter by fact, and the URL IS the query — an agent can use the
 * same URL. The page prerenders every tool; the browser does the narrowing,
 * so every filter permutation is instant and nothing renders on request.
 */
export default function ToolsPage() {
  return (
    <>
      <HeroBanner title="Every tool your agent can run" />
      <Page>
        <ToolsCatalog />
      </Page>
    </>
  )
}

async function ToolsCatalog() {
  const [tools, tags] = await Promise.all([
    loadToolSearchItems(),
    loadTagChips(),
  ])
  return (
    <>
      <JsonLd data={collectionJsonLd(SITE_ORIGIN, PAGE, listingItems(tools))} />
      <ToolsExplorer tags={tags} tools={tools} />
    </>
  )
}
