import { Suspense } from 'react'
import {
  CatalogList,
  type CatalogListItem,
  toolListItem,
  workflowListItem,
} from '@/components/catalog/list'
import { CatalogShell } from '@/components/home/catalog-shell'
import { CatalogTabs } from '@/components/home/catalog-tabs'
import { RankedWorkflows } from '@/components/home/ranked-workflows'
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
  const workflowItems = workflows.map(workflowListItem)

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

  // Workflows order three ways when copies are counted, from a dropdown
  // beside the search: New is prerendered; Hot and Popular are read at
  // request time and stream into their holes.
  const angles: ReadonlyArray<CopyAngle> = ['hot', 'popular']
  const workflowViews = (section: (typeof SECTIONS)[number]) => [
    { value: 'new', label: 'New', content: listOf(section) },
    ...angles.map((angle) => ({
      value: angle,
      label: COPY_ANGLES[angle].label,
      params: { sort: angle },
      content: (
        <Suspense fallback={null}>
          <RankedWorkflows angle={angle} limit={PREVIEW} />
        </Suspense>
      ),
    })),
  ]

  return (
    <CatalogShell>
      <CatalogTabs
        tabs={SECTIONS.map((section) => ({
          value: section.href.slice(1),
          entity: section.entity,
          href: section.href,
          label: section.label,
          ...(isCounting && section.entity === 'workflow'
            ? { views: workflowViews(section) }
            : { content: listOf(section) }),
        }))}
      />
    </CatalogShell>
  )
}
