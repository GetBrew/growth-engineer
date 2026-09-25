import { Linkedin01Icon, NewTwitterIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { Suspense } from 'react'
import {
  CatalogList,
  toolListItem,
  workflowListItem,
} from '@/components/catalog/list'
import { EntityLogo } from '@/components/common/entity-logo'
import { NoResults } from '@/components/common/no-results'
import { ShareButton } from '@/components/detail/share-button'
import { LINK_ICON, META_CHIP, PANEL_HEADING } from '@/components/detail/styles'
import { DetailTabs } from '@/components/detail/tabs'
import { ViewSourceButton } from '@/components/detail/view-source-button'
import { BackLink } from '@/components/layout/back-link'
import { Page } from '@/components/layout/page'
import { JsonLd } from '@/components/seo/json-ld'
import { CompanyDetailSkeleton } from '@/components/skeletons/company-detail-skeleton'
import { buttonVariants } from '@/components/ui/button'
import { isValidHandle, refToFilePath, refToPath } from '@/lib/catalog/keys'
import {
  loadCompany,
  loadToolsByCompany,
  loadWorkflowsByCompany,
  resolveAlias,
} from '@/lib/catalog/loaders'
import { companyParams } from '@/lib/catalog/static-params'
import { SITE_ORIGIN } from '@/lib/env'
import { pageMetadata } from '@/lib/seo/metadata'
import { companyJsonLd } from '@/lib/seo/structured-data'
import { cn } from '@/lib/utils/cn'

type Params = Promise<{ handle: string }>

const SOCIAL =
  'focus-ring grid size-8 place-items-center rounded-full text-subtle transition-colors hover:bg-hover hover:text-foreground'

export function generateStaticParams() {
  return companyParams()
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { handle } = await params
  const company = isValidHandle(handle) ? await loadCompany(handle) : null
  if (!company) {
    return {}
  }
  const ref = { type: 'company' as const, key: company.key, version: undefined }
  return pageMetadata({
    title: company.name,
    description:
      company.tagline ??
      company.description ??
      `${company.name}: the tools it makes and the workflows that use them.`,
    path: refToPath(ref),
    file: refToFilePath(ref),
  })
}

export default function CompanyPage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-(--space-record)">
      <BackLink href="/companies" label="All companies" />
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
    const alias = await resolveAlias('company', handle)
    if (alias) {
      permanentRedirect(`/companies/${alias.key}`)
    }
    notFound()
  }

  const facts = [
    company.headquarters,
    company.founded ? `Founded ${company.founded}` : undefined,
  ].filter((fact): fact is string => Boolean(fact))

  return (
    <div className="flex flex-col">
      <JsonLd data={companyJsonLd(SITE_ORIGIN, company)} />
      <header>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex min-w-0 items-center gap-3">
            <EntityLogo
              logoUrl={company.logo?.url}
              name={company.name}
              size={44}
            />
            <h1 className="type-page-title">{company.name}</h1>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <ShareButton
              text={company.tagline ?? company.description}
              title={company.name}
            />
            <ViewSourceButton entityKey={company.key} type="company" />
            {company.links.website ? (
              <a
                className={buttonVariants({ size: 'pill', variant: 'outline' })}
                href={company.links.website}
                rel="noreferrer"
                target="_blank"
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  icon={LINK_ICON.website}
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

        {facts.length > 0 || company.status === 'deprecated' ? (
          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            {facts.map((fact) => (
              <span className={META_CHIP} key={fact}>
                {fact}
              </span>
            ))}
            {company.status === 'deprecated' ? (
              <span
                className={cn(
                  META_CHIP,
                  'border-foreground/20 bg-hover text-soft'
                )}
              >
                Deprecated
              </span>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="mt-[calc(var(--space-block)/2)] border-t border-dashed pt-[calc(var(--space-block)/2)]">
        <DetailTabs
          label="Company sections"
          sections={[
            {
              value: 'overview',
              label: 'Overview',
              content: (
                <div className="flex flex-col gap-8">
                  <section className="flex flex-col gap-3">
                    <h2 className={cn(PANEL_HEADING, 'min-h-0')}>Overview</h2>
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
                <section className="flex flex-col">
                  <div className="flex flex-col gap-(--space-3xs)">
                    <h2 className={cn(PANEL_HEADING, 'min-h-0')}>Workflows</h2>
                    <p className="type-body">
                      {workflows.length}{' '}
                      {workflows.length === 1 ? 'workflow' : 'workflows'} using{' '}
                      {company.name}.
                    </p>
                  </div>
                  {workflows.length === 0 ? (
                    <NoResults
                      description={`No published workflow uses ${company.name} yet.`}
                      entity="workflow"
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
                <section className="flex flex-col">
                  <div className="flex flex-col gap-(--space-3xs)">
                    <h2 className={cn(PANEL_HEADING, 'min-h-0')}>Tools</h2>
                    <p className="type-body">
                      What agents can reach at {company.name}.
                    </p>
                  </div>
                  {tools.length === 0 ? (
                    <NoResults
                      description="A tool is listed once an agent can reach it over MCP, CLI or API."
                      entity="tool"
                      title="No published tools yet"
                    />
                  ) : (
                    <CatalogList
                      items={tools.map((tool) =>
                        toolListItem({
                          tool: {
                            key: tool.key,
                            name: tool.name,
                            summary: tool.summary,
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
