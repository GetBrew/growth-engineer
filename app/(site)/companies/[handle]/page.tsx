import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  CatalogList,
  toolListItem,
  workflowListItem,
} from '@/components/catalog/list'
import { CodeText } from '@/components/common/code-text'
import { NoResults } from '@/components/common/no-results'
import {
  DETAIL_DATE,
  DetailByline,
  DetailHeader,
} from '@/components/detail/header'
import {
  DETAIL_ACTION_ICON,
  HEADER_ACTION_COLLAPSING,
  LINK_ICON,
  PANEL_HEADING,
} from '@/components/detail/styles'
import { DetailTabs } from '@/components/detail/tabs'
import { ViewSourceButton } from '@/components/detail/view-source-button'
import { BackLink } from '@/components/layout/back-link'
import { Page } from '@/components/layout/page'
import { JsonLd } from '@/components/seo/json-ld'
import { isValidHandle, refToFilePath, refToPath } from '@/lib/catalog/keys'
import {
  loadCompany,
  loadDocument,
  loadTagChips,
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
  const company = isValidHandle(handle) ? loadCompany(handle) : null
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

export default function CompanyPage({ params }: { params: Params }) {
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
  const [company, tools, workflows, document, tags] = [
    loadCompany(handle),
    loadToolsByCompany(handle),
    loadWorkflowsByCompany(handle),
    loadDocument('company', handle),
    loadTagChips(),
  ]
  if (!company) {
    const alias = resolveAlias('company', handle)
    if (alias) {
      permanentRedirect(`/companies/${alias.key}`)
    }
    notFound()
  }
  const category = tags.find(
    (tag) => tag.key === `category:${company.category}`
  )?.label

  return (
    <div className="flex flex-col gap-(--space-block)">
      <JsonLd
        data={companyJsonLd(
          SITE_ORIGIN,
          company,
          document?.updatedAt ?? company.updatedAt
        )}
      />
      <DetailHeader
        actions={
          <>
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
                size={DETAIL_ACTION_ICON}
                strokeWidth={1.8}
              />
              <span className="max-sm:sr-only">Website</span>
            </a>
          </>
        }
        byline={
          <DetailByline
            avatars={[
              { name: company.name, src: company.logo?.url, logo: true },
            ]}
          >
            {category ? (
              <Link
                className="focus-ring rounded-sm text-foreground underline-offset-4 hover:underline"
                href={`/companies?category=${company.category}`}
              >
                {category}
              </Link>
            ) : (
              company.domain
            )}
          </DetailByline>
        }
        description={company.tagline}
        hasIconActions
        meta={`Updated ${DETAIL_DATE.format(document?.updatedAt ?? company.updatedAt)}`}
        tags={
          company.status === 'deprecated'
            ? [{ label: 'Deprecated', emphasis: true }]
            : []
        }
        title={company.name}
      />

      <DetailTabs
        label="Company sections"
        sections={[
          {
            value: 'overview',
            label: 'Overview',
            content: (
              <Panel title="Overview">
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
                      <p className="type-helper text-soft" key={paragraph}>
                        <CodeText text={paragraph.trim()} />
                      </p>
                    ))}
                </div>
              </Panel>
            ),
          },
          {
            value: 'workflows',
            label: 'Workflows',
            count: workflows.length,
            content: (
              <Panel
                description={`Workflows that use ${company.name}'s tools.`}
                title="Workflows"
              >
                {workflows.length === 0 ? (
                  <NoResults
                    description={`No published workflow uses ${company.name} yet.`}
                    entity="workflow"
                    title="No workflows yet"
                  />
                ) : (
                  <CatalogList items={workflows.map(workflowListItem)} />
                )}
              </Panel>
            ),
          },
          {
            value: 'tools',
            label: 'Tools',
            count: tools.length,
            content: (
              <Panel
                description={`What agents can reach at ${company.name}.`}
                title="Tools"
              >
                {tools.length === 0 ? (
                  <NoResults
                    description="A tool is listed once an agent can reach it over MCP, CLI or API."
                    entity="tool"
                    title="No published tools yet"
                  />
                ) : (
                  <CatalogList
                    items={tools.map((tool) => ({
                      ...toolListItem({
                        tool: {
                          key: tool.key,
                          name: tool.name,
                          summary: tool.summary,
                          access: [
                            ...new Set(tool.access.map((entry) => entry.type)),
                          ],
                        },
                        company: {
                          key: company.key,
                          name: company.name,
                          logoUrl: company.logo?.url,
                        },
                      }),
                      // Every tool here is this company's: no name before
                      // the summary.
                      description: tool.summary,
                    }))}
                  />
                )}
              </Panel>
            ),
          },
        ]}
      />
    </div>
  )
}

/**
 * One tab's panel, the same shape for all three: its heading, one quiet
 * line saying what is in it (the count is on the tab), then the content.
 */
function Panel({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className={cn(PANEL_HEADING, 'min-h-0')}>{title}</h2>
        {description ? (
          <p className="type-helper text-soft">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}
