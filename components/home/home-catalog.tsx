import { connection } from 'next/server'
import {
  CatalogList,
  type CatalogListItem,
  toolListItem,
  workflowListItem,
} from '@/components/catalog/catalog-list'
import {
  loadCompanies,
  loadWorkflows,
  searchTools,
} from '@/lib/catalog/loaders'

import { CatalogShell } from './catalog-shell'
import { CatalogTabs } from './catalog-tabs'

const PREVIEW = 5

// fetches latest 5
export async function HomeCatalog() {
  await connection()
  const [workflows, tools, companies] = await Promise.all([
    loadWorkflows('new', PREVIEW),
    searchTools('', [], PREVIEW),
    loadCompanies(PREVIEW, undefined, false),
  ])

  const workflowItems = workflows.map(workflowListItem)

  const toolItems = tools.results.map(toolListItem)

  const companyItems: Array<CatalogListItem> = companies.map(
    ({ company, access }) => ({
      id: company._id,
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
            icon: '/workflow.svg',
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
            icon: '/tool.svg',
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
            icon: '/company.svg',
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
