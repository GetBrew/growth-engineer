import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Page, SectionHeading } from '@/components/catalog/primitives'
import { FocusedNode, MapSkeleton } from '@/components/map/focused'
import { parseRef } from '@/lib/catalog/keys'
import { loadNeighborhood } from '@/lib/catalog/loaders'
import { mapFocusParams } from '@/lib/catalog/static-params'

type Params = Promise<{ focus: Array<string> }>

/**
 * `/map/tool/clay/enrich-contacts`: one node and everything touching it. A
 * PAGE PER NODE, all prerendered, so exploring the graph is a static
 * navigation from one file to the next — no query string, no request-time
 * work, and every focus is a link an agent can follow.
 */
export function generateStaticParams() {
  return mapFocusParams()
}

async function resolveRef(params: Params) {
  const { focus } = await params
  const [type, ...rest] = focus.map((part) => decodeURIComponent(part))
  const ref =
    type && rest.length > 0 ? parseRef(`${type}:${rest.join('/')}`) : null
  return ref && ref.version === undefined ? ref : null
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const ref = await resolveRef(params)
  const result = ref ? await loadNeighborhood(ref.type, ref.key) : null
  return result
    ? {
        title: `${result.node.name} · Relationship map`,
        description: `What ${result.node.name} is connected to in the catalog.`,
      }
    : {}
}

export default function MapFocusPage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-8">
      <SectionHeading
        as="h1"
        description="What is connected to what. Every company, tool and workflow, with the edges between them — the one view the catalog pages do not give you."
        title="Relationship map"
      />
      <Suspense fallback={<MapSkeleton />}>
        <Focused params={params} />
      </Suspense>
    </Page>
  )
}

async function Focused({ params }: { params: Params }) {
  const ref = await resolveRef(params)
  if (!ref) {
    notFound()
  }
  const result = await loadNeighborhood(ref.type, ref.key)
  if (!result) {
    notFound()
  }
  return <FocusedNode groups={result.groups} node={result.node} />
}
