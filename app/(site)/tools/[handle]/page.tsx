import { isValidHandle } from '@convex/model/keys'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { ToolCard } from '@/components/catalog/cards'
import {
  EmptyState,
  Page,
  SectionHeading,
} from '@/components/catalog/primitives'
import { ToolCardsSkeleton } from '@/components/catalog/skeletons'
import {
  loadCompany,
  loadToolsByCompany,
  resolveAlias,
} from '@/lib/catalog/loaders'

type Params = Promise<{ handle: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { handle } = await params
  const company = isValidHandle(handle) ? await loadCompany(handle) : null
  return company ? { title: `${company.name} tools` } : {}
}

/** A company's tools — or, when it has exactly one, that tool's page. */
export default function CompanyToolsPage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-8">
      <Suspense fallback={<ToolCardsSkeleton cards={3} />}>
        <CompanyTools params={params} />
      </Suspense>
    </Page>
  )
}

async function CompanyTools({ params }: { params: Params }) {
  const { handle } = await params
  if (!isValidHandle(handle)) {
    notFound()
  }
  const [company, tools] = await Promise.all([
    loadCompany(handle),
    loadToolsByCompany(handle),
  ])
  if (!company) {
    const alias = await resolveAlias('company', handle)
    if (alias) {
      permanentRedirect(`/tools/${alias.key}`)
    }
    notFound()
  }
  if (tools.length === 1 && tools[0]) {
    permanentRedirect(`/tools/${tools[0].key}`)
  }

  return (
    <>
      <SectionHeading
        as="h1"
        description={company.tagline}
        eyebrow={
          <Link
            className="hover:text-foreground"
            href={`/companies/${company.key}`}
          >
            ← {company.name}
          </Link>
        }
        title={`Tools by ${company.name}`}
      />
      {tools.length === 0 ? (
        <EmptyState
          hint="A tool is listed once an agent can reach it over MCP, CLI or API."
          title="No published tools yet"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              company={{
                key: company.key,
                name: company.name,
                logoUrl: company.logo?.url,
              }}
              key={tool._id}
              tool={tool}
            />
          ))}
        </div>
      )}
    </>
  )
}
