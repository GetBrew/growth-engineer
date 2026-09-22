import { isValidHandle } from '@convex/model/keys'
import {
  Globe02Icon,
  Linkedin01Icon,
  NewTwitterIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import {
  CatalogList,
  toolListItem,
  workflowListItem,
} from '@/components/catalog/catalog-list'
import { DetailTabs } from '@/components/catalog/detail-tabs'
import { EntityLogo } from '@/components/catalog/entity-logo'
import { NoResults } from '@/components/catalog/no-results'
import { Page } from '@/components/catalog/primitives'
import { MaskIcon } from '@/components/site/mask-icon'
import { CompanyDetailSkeleton } from '@/components/skeletons/company-detail-skeleton'
import {
  loadCompany,
  loadToolsByCompany,
  loadWorkflowsByCompany,
  resolveAlias,
} from '@/lib/catalog/loaders'

type Params = Promise<{ handle: string }>

const PANEL_HEADING = 'type-section'

const SOCIAL =
  'focus-ring grid size-8 place-items-center rounded-full text-subtle transition-colors hover:bg-hover hover:text-foreground'

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
    <Page>
      <Suspense fallback={<CompanyDetailSkeleton />}>
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
    // `resolveAlias` is an UNCACHED read, and Next's prospective prerender
    // walks this branch speculatively — where it reaches the Convex client and
    // reports its `Math.random()` as an unstable value, dropping the route out
    // of prerendering entirely. Saying plainly that the miss path is
    // request-time keeps the hit path (the normal case) prerenderable.
    await connection()
    const alias = await resolveAlias('company', handle)
    if (alias) {
      permanentRedirect(`/companies/${alias.key}`)
    }
    notFound()
  }

  return (
    <div className="flex flex-col">
      <Link
        className="type-control w-fit text-subtle transition-colors hover:text-foreground"
        href="/companies"
      >
        ← All companies
      </Link>

      <header className="mt-8">
        <div className="flex items-center gap-3">
          <EntityLogo
            domain={company.domain}
            logoUrl={company.logo?.url}
            name={company.name}
            size={44}
          />
          <h1 className="type-page-title">{company.name}</h1>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex flex-wrap items-center gap-1.5">
            {company.tagline ? (
              <p className="type-body max-w-xl">{company.tagline}</p>
            ) : null}
            {company.status === 'deprecated' ? (
              <span className="type-meta flex h-6 items-center rounded-full border border-foreground/20 bg-hover px-2.5 text-soft">
                Deprecated
              </span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            {company.links.website ? (
              <a
                className="ai-metallic-trigger focus-ring type-control inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-foreground"
                href={company.links.website}
                rel="noreferrer"
                target="_blank"
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  icon={Globe02Icon}
                  size={16}
                  strokeWidth={1.8}
                />
                Website
              </a>
            ) : null}
            <div className="flex items-center gap-0.5">
              {company.links.x ? (
                <a
                  aria-label={`${company.name} on X`}
                  className={SOCIAL}
                  href={company.links.x}
                  rel="noreferrer"
                  target="_blank"
                >
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={NewTwitterIcon}
                    size={15}
                    strokeWidth={1.8}
                  />
                </a>
              ) : null}
              {company.links.linkedin ? (
                <a
                  aria-label={`${company.name} on LinkedIn`}
                  className={SOCIAL}
                  href={company.links.linkedin}
                  rel="noreferrer"
                  target="_blank"
                >
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={Linkedin01Icon}
                    size={16}
                    strokeWidth={1.8}
                  />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="mt-12">
        <DetailTabs
          label="Company sections"
          sections={[
            {
              value: 'overview',
              label: 'Overview',
              content: (
                <div className="flex flex-col gap-8">
                  <section className="flex flex-col gap-2">
                    <h2 className={PANEL_HEADING}>Overview</h2>
                    <p className="type-body max-w-2xl">
                      {company.description ??
                        company.tagline ??
                        `${company.name} has no description yet.`}
                    </p>
                  </section>
                </div>
              ),
            },
            {
              value: 'workflows',
              label: 'Workflows',
              count: workflows.length,
              content: (
                <section className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <h2 className={PANEL_HEADING}>Workflows</h2>
                    <p className="type-body">
                      {workflows.length}{' '}
                      {workflows.length === 1 ? 'workflow' : 'workflows'} using{' '}
                      {company.name}.
                    </p>
                  </div>
                  {workflows.length === 0 ? (
                    <NoResults
                      description={`No published workflow uses ${company.name} yet.`}
                      icon={<MaskIcon size={20} src="/workflow.svg" />}
                      title="No workflows yet"
                    />
                  ) : (
                    <CatalogList items={workflows.map(workflowListItem)} />
                  )}
                </section>
              ),
            },
            {
              value: 'tools',
              label: 'Tools',
              count: tools.length,
              content: (
                <section className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <h2 className={PANEL_HEADING}>Tools</h2>
                    <p className="type-body">
                      What agents can reach at {company.name}.
                    </p>
                  </div>
                  {tools.length === 0 ? (
                    <NoResults
                      description="A tool is listed once an agent can reach it over MCP, CLI or API."
                      icon={<MaskIcon size={20} src="/tool.svg" />}
                      title="No published tools yet"
                    />
                  ) : (
                    <CatalogList
                      items={tools.map((tool) =>
                        toolListItem({
                          tool: {
                            _id: tool._id,
                            key: tool.key,
                            name: tool.name,
                            summary: tool.summary,
                            agentLevel: tool.agentLevel,
                            access: [
                              ...new Set(
                                tool.access.map((entry) => entry.type)
                              ),
                            ],
                          },
                          company: {
                            key: company.key,
                            name: company.name,
                            logoUrl: company.logo?.url,
                          },
                        })
                      )}
                    />
                  )}
                </section>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
