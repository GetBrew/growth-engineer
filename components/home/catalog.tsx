import { Suspense } from 'react'
import {
  CatalogList,
  type CatalogListItem,
  toolListItem,
  workflowListItem,
} from '@/components/catalog/list'
import { CatalogShell } from '@/components/home/catalog-shell'
import { CatalogTabs } from '@/components/home/catalog-tabs'
import {
  RankedWorkflows,
  WorkflowCopies,
} from '@/components/home/ranked-workflows'
import { WorkflowAngles } from '@/components/home/workflow-angles'
import {
  loadCompanies,
  loadNewTools,
  loadWorkflows,
} from '@/lib/catalog/loaders'
import { SECTIONS } from '@/lib/constants/sections'
import { hasCopyCounter } from '@/lib/usage/copies'
import { COPY_ANGLES, type CopyAngle } from '@/lib/usage/stats'

const PREVIEW = 10

export function HomeCatalog() {
  const [workflows, tools, companies] = [
    loadWorkflows('new', PREVIEW),
    loadNewTools(PREVIEW),
    loadCompanies(PREVIEW),
  ]

  const isCounting = hasCopyCounter()
  const workflowItems = workflows.map((row) => ({
    ...workflowListItem(row),
    ...(isCounting
      ? {
          metric: (
            <Suspense fallback={null}>
              <WorkflowCopies workflowKey={row.workflow.key} />
            </Suspense>
          ),
        }
      : {}),
  }))

  const toolItems = tools.map(toolListItem)

  const companyItems: Array<CatalogListItem> = companies.map(({ company }) => ({
    id: company.key,
    href: `/companies/${company.key}`,
    title: company.name,
    logo: {
      name: company.name,
      logoUrl: company.logoUrl,
    },
    description: company.description ?? company.tagline,
  }))

  const items: Record<string, ReadonlyArray<CatalogListItem>> = {
    workflow: workflowItems,
    tool: toolItems,
    company: companyItems,
  }

  const listOf = (section: (typeof SECTIONS)[number]) => (
    <CatalogList
      all={{
        href: section.href,
        label: `View all ${section.label.toLowerCase()}`,
      }}
      items={items[section.entity] ?? []}
    />
  )

  // Workflows open three ways when copies are counted: New is prerendered;
  // Hot and Popular are read at request time and stream into their holes.
  const angles: ReadonlyArray<CopyAngle> = ['hot', 'popular']
  const workflowsContent = (section: (typeof SECTIONS)[number]) =>
    isCounting ? (
      <WorkflowAngles
        panels={[
          { value: 'new', label: 'New', content: listOf(section) },
          ...angles.map((angle) => ({
            value: angle,
            label: COPY_ANGLES[angle].label,
            content: (
              <Suspense fallback={null}>
                <RankedWorkflows angle={angle} limit={PREVIEW} />
              </Suspense>
            ),
          })),
        ]}
      />
    ) : (
      listOf(section)
    )

  return (
    <CatalogShell>
      <CatalogTabs
        tabs={SECTIONS.map((section) => ({
          value: section.href.slice(1),
          entity: section.entity,
          href: section.href,
          label: section.label,
          content:
            section.entity === 'workflow'
              ? workflowsContent(section)
              : listOf(section),
        }))}
      />
    </CatalogShell>
  )
}
