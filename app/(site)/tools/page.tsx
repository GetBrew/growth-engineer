import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HeroBanner } from '@/components/catalog/hero-banner'
import { ToolsExplorer } from '@/components/catalog/tools-explorer'
import { Page } from '@/components/layout/primitives'
import { ToolsSkeleton } from '@/components/skeletons/tools-skeleton'
import { loadTagChips, loadToolSearchItems } from '@/lib/catalog/loaders'

export const metadata: Metadata = {
  title: 'Tools',
  description:
    'Every tool an agent can reach over MCP, CLI or API, with the file to set it up.',
}

export default function ToolsPage() {
  return (
    <>
      <HeroBanner title="Every tool your agent can run" />
      <Page>
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
  return <ToolsExplorer tags={tags} tools={tools} />
}
