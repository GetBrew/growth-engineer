import { isValidHandle } from '@convex/model/keys'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import { ToolCard, WorkflowRow } from '@/components/catalog/cards'
import { EntityLogo } from '@/components/catalog/entity-logo'
import { EmptyState, Page } from '@/components/catalog/primitives'
import {
  HeaderSkeleton,
  ToolCardsSkeleton,
} from '@/components/catalog/skeletons'
import { Badge } from '@/components/ui/badge'
import {
  loadCompany,
  loadToolsByCompany,
  loadWorkflowsByCompany,
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
  return company ? { title: company.name, description: company.tagline } : {}
}

/** A company, its tools, and the workflows that use them. */
export default function CompanyPage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-10">
      <Suspense
        fallback={
          <div className="flex flex-col gap-10">
            <HeaderSkeleton />
            <ToolCardsSkeleton cards={3} />
          </div>
        }
      >
        <CompanyDetail params={params} />
      </Suspense>
    </Page>
  )
}

async function CompanyDetail({ params }: { params: Params }) {
  const { handle } = await params
  if (!isValidHandle(handle)) {
    notFound()
  }
  const [company, tools, workflows] = await Promise.all([
    loadCompany(handle),
    loadToolsByCompany(handle),
    loadWorkflowsByCompany(handle),
  ])
  if (!company) {
    const alias = await resolveAlias('company', handle)
    if (alias) {
      permanentRedirect(`/companies/${alias.key}`)
    }
    notFound()
  }

  const links = [
    ['Website', company.links.website],
    ['Docs', company.links.docs],
    ['GitHub', company.links.github],
    ['LinkedIn', company.links.linkedin],
    ['X', company.links.x],
  ].filter((entry): entry is [string, string] => typeof entry[1] === 'string')

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-6 border-border border-b pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <EntityLogo
            domain={company.domain}
            logoUrl={company.logo?.url}
            name={company.name}
            size={56}
          />
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-semibold text-3xl tracking-[-0.04em] sm:text-4xl">
                {company.name}
              </h1>
              <Badge variant="company">{company.kind.replace('_', ' ')}</Badge>
              {company.status === 'deprecated' ? (
                <Badge variant="workflow">
                  <AlertTriangle aria-hidden="true" className="size-3" />{' '}
                  Deprecated
                </Badge>
              ) : null}
            </div>
            {company.tagline ? (
              <p className="max-w-2xl text-base text-foreground/70 leading-7">
                {company.tagline}
              </p>
            ) : null}
            {company.description ? (
              <p className="max-w-2xl text-foreground/60 text-sm leading-6">
                {company.description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map(([label, href]) => (
            <a
              className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-4 text-sm transition-colors hover:border-foreground/25"
              href={href}
              key={label}
              rel="noreferrer"
              target="_blank"
            >
              {label} <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          ))}
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-semibold text-xl tracking-[-0.025em]">Tools</h2>
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
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-semibold text-xl tracking-[-0.025em]">
          Workflows using {company.name}
        </h2>
        {workflows.length === 0 ? (
          <EmptyState
            title={`No published workflow uses ${company.name} yet`}
          />
        ) : (
          <div className="flex flex-col border-border border-t">
            {workflows.map((row) => (
              <WorkflowRow key={row.workflow._id} {...row} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
