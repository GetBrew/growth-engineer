import {
  CatalogList,
  type CatalogListItem,
  toolListItem,
  workflowListItem,
} from '@/components/catalog/catalog-list'
import { CatalogShell } from '@/components/home/catalog-shell'
import { CatalogTabs } from '@/components/home/catalog-tabs'
import {
  loadCompanies,
  loadNewTools,
  loadWorkflows,
} from '@/lib/catalog/loaders'

const PREVIEW = 10

export async function HomeCatalog() {
  const [workflows, tools, companies] = await Promise.all([
    loadWorkflows('new', PREVIEW),
    loadNewTools(PREVIEW),
    loadCompanies(PREVIEW, undefined, false),
  ])

  const workflowItems = workflows.map(workflowListItem)

  const toolItems = tools.map(toolListItem)

  const companyItems: Array<CatalogListItem> = companies.map(
    ({ company, access }) => ({
      id: company.key,
      href: `/companies/${company.key}`,
      title: company.name,
      logo: {
        name: company.name,
        logoUrl: company.logoUrl,
        domain: company.domain,
      },
      pills: access.map((type) => type.toUpperCase()),
      description: company.description ?? company.tagline,
    })
  )

  return (
    <CatalogShell>
      <CatalogTabs
        tabs={[
          {
            value: 'workflows',
            entity: 'workflow',
            href: '/workflows',
            label: 'Workflows',
            content: (
              <CatalogList
                all={{ href: '/workflows', label: 'View all workflows' }}
                items={workflowItems}
              />
            ),
          },
          {
            value: 'tools',
            entity: 'tool',
            href: '/tools',
            label: 'Tools',
            content: (
              <CatalogList
                all={{ href: '/tools', label: 'View all tools' }}
                items={toolItems}
              />
            ),
          },
          {
            value: 'companies',
            entity: 'company',
            href: '/companies',
            label: 'Companies',
            content: (
              <CatalogList
                all={{ href: '/companies', label: 'View all companies' }}
                items={companyItems}
              />
            ),
          },
        ]}
      />
    </CatalogShell>
  )
}
