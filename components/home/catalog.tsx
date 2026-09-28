import {
  CatalogList,
  type CatalogListItem,
  toolListItem,
  workflowListItem,
} from '@/components/catalog/list'
import { CatalogShell } from '@/components/home/catalog-shell'
import { CatalogTabs } from '@/components/home/catalog-tabs'
import {
  loadCompanies,
  loadNewTools,
  loadWorkflows,
} from '@/lib/catalog/loaders'
import { SECTIONS } from '@/lib/constants/sections'

const PREVIEW = 10

export function HomeCatalog() {
  const [workflows, tools, companies] = [
    loadWorkflows('featured', PREVIEW),
    loadNewTools(PREVIEW),
    loadCompanies(PREVIEW),
  ]

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

  return (
    <CatalogShell>
      <CatalogTabs
        tabs={SECTIONS.map((section) => ({
          value: section.href.slice(1),
          entity: section.entity,
          href: section.href,
          label: section.label,
          content: (
            <CatalogList
              all={{
                href: section.href,
                label: `View all ${section.label.toLowerCase()}`,
              }}
              items={items[section.entity] ?? []}
            />
          ),
        }))}
      />
    </CatalogShell>
  )
}
