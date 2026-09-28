import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import {
  CatalogList,
  toolListItem,
  workflowListItem,
} from '@/components/catalog/list'
import { CodeText } from '@/components/common/code-text'
import { EntityLogo } from '@/components/common/entity-logo'
import { NoResults } from '@/components/common/no-results'
import { ShareButton } from '@/components/detail/share-button'
import {
  HEADER_ACTION_COLLAPSING,
  LINK_ICON,
  PANEL_HEADING,
} from '@/components/detail/styles'
import { DetailTabs } from '@/components/detail/tabs'
import { ViewSourceButton } from '@/components/detail/view-source-button'
import { BackLink } from '@/components/layout/back-link'
import { Page } from '@/components/layout/page'
import { JsonLd } from '@/components/seo/json-ld'
import { Badge } from '@/components/ui/badge'
import { isValidHandle, refToFilePath, refToPath } from '@/lib/catalog/keys'
import {
  loadCompany,
  loadDocument,
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

const BLANK_LINE = /\n\s*\n/

/**
 * Every page here is prerendered from `generateStaticParams`, and reading
 * `params` outside `<Suspense>` is deliberate: nothing loads. So navigating
 * here may block rather than show a fallback; `instant = false` says so.
 */
export const instant = false

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
  const ref = { type: 'company' as const, key: company.key }
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

export default async function CompanyPage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-(--space-record)">
      <BackLink href="/companies" label="All companies" />
      <CompanyDetail params={params} />
    </Page>
  )
}

async function CompanyDetail({ params }: { params: Params }) {
  const { handle } = await params
  if (!isValidHandle(handle)) {
    notFound()
  }
  const [company, tools, workflows, document] = await Promise.all([
    loadCompany(handle),
    loadToolsByCompany(handle),
    loadWorkflowsByCompany(handle),
    loadDocument('company', handle),
  ])
  if (!company) {
    const alias = await resolveAlias('company', handle)
    if (alias) {
      permanentRedirect(`/companies/${alias.key}`)
    }
    notFound()
  }

  return (
    <div className="flex flex-col">
      <JsonLd
        data={companyJsonLd(
          SITE_ORIGIN,
          company,
          document?.updatedAt ?? company.updatedAt
        )}
      />
      <header>
        {/* One row on every screen: the name on the left, the actions as
            icons on the right (labels join them from sm). */}
        <div className="flex items-center justify-between gap-3 sm:gap-8">
          <div className="flex min-w-0 items-center gap-3">
            <EntityLogo
              logoUrl={company.logo?.url}
              name={company.name}
              size={44}
            />
            {/* A step smaller on the narrowest phones; a longer name wraps
                rather than losing its end. */}
            <h1 className="type-page-title min-w-0 max-[22.5rem]:text-[26px]">
              {company.name}
            </h1>
          </div>

          {/* Phones: 32px icons so the name keeps its room beside them, and
              -mr-2 lines the last glyph up with the page edge (a borderless
              icon's padding would indent it). */}
          <div className="flex shrink-0 items-center gap-2.5 max-sm:-mr-2 max-sm:gap-0 max-sm:[&_a]:size-8 max-sm:[&_button]:size-8">
            <ShareButton
              text={company.tagline ?? company.description}
              title={company.name}
            />
            <ViewSourceButton entityKey={company.key} type="company" />
            <a
              className={HEADER_ACTION_COLLAPSING}
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
              <span className="max-sm:sr-only">Website</span>
            </a>
          </div>
        </div>

        {company.status === 'deprecated' ? (
          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            <Badge variant="emphasis">Deprecated</Badge>
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
                    {/* The body is markdown: one <p> per paragraph, and
                        `backticks` set as code. */}
                    <div className="flex max-w-2xl flex-col gap-4">
                      {(
                        company.description ??
                        company.tagline ??
                        `${company.name} has no description yet.`
                      )
                        .split(BLANK_LINE)
                        .map((paragraph) => (
                          <p className="type-body" key={paragraph}>
                            <CodeText text={paragraph.trim()} />
                          </p>
                        ))}
                    </div>
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
