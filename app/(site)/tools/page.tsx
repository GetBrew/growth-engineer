import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HeroBanner } from '@/components/catalog/hero-banner'
import { Page, SectionHeading } from '@/components/catalog/primitives'
import { ToolsExplorer } from '@/components/catalog/tools-explorer'
import { HeroActions } from '@/components/catalog/works-with-agents'
import { JsonLd } from '@/components/seo/json-ld'
import { ToolsSkeleton } from '@/components/skeletons/tools-skeleton'
import { buttonVariants } from '@/components/ui/button'
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
      <HeroBanner
        description="Discover agent-ready tools available through MCP, CLI, and API."
        eyebrow="Tools"
        icon="/tool.svg"
        title="Tools your agent can run"
      >
        <HeroActions>
          <a
            className={buttonVariants({ size: 'pill' })}
            href="https://github.com/GetBrew/growth-engineer/blob/main/CONTRIBUTING.md"
            rel="noreferrer"
            target="_blank"
          >
            Add a tool
          </a>
        </HeroActions>
      </HeroBanner>
      <Page className="flex flex-col gap-8">
        <SectionHeading
          description="Every tool an agent can reach over MCP, CLI or API."
          title="Discover tools"
        />
        <Suspense fallback={<ToolsSkeleton />}>
          <ToolsCatalog />
        </Suspense>
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
