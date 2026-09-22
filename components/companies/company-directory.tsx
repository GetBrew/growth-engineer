'use client'

import { useSearchParams } from 'next/navigation'
import { CompanyRow } from '@/components/catalog/cards'
import { CatalogSearch } from '@/components/catalog/catalog-search'
import { CategorySection } from '@/components/catalog/category-section'
import { ListingToolbar } from '@/components/catalog/listing-toolbar'
import { NoResults } from '@/components/catalog/no-results'
import {
  type CompanySearchItem,
  searchCompanyItems,
} from '@/lib/catalog/search'
import type { TagChip } from '@/lib/catalog/types'

/** `/companies`, `/companies?category=crm&q=clay`: the URL is the filter. */
function companiesHref(q: string, category: string): string {
  const search = new URLSearchParams()
  if (q) {
    search.set('q', q)
  }
  if (category) {
    search.set('category', category)
  }
  const query = search.toString()
  return query ? `/companies?${query}` : '/companies'
}

/**
 * The companies directory: category pills and search, then companies grouped
 * by category. The page prerenders every company; this reads the URL and
 * narrows the list in the browser, so the page stays static.
 */
export function CompanyDirectory({
  companies,
  categories,
}: {
  companies: ReadonlyArray<CompanySearchItem>
  categories: ReadonlyArray<TagChip>
}) {
  const searchParams = useSearchParams()
  const q = (searchParams.get('q') ?? '').trim()
  const category = (searchParams.get('category') ?? '').trim()
  const rows = searchCompanyItems(companies, {
    q,
    ...(category ? { category } : {}),
  })
  const sections = new Map<string, Array<CompanySearchItem>>()
  for (const row of rows) {
    const label = row.category?.label ?? 'Other'
    sections.set(label, [...(sections.get(label) ?? []), row])
  }

  return (
    <div className="flex flex-col gap-10">
      <ListingToolbar
        groups={[
          {
            key: 'category',
            label: 'Filter companies by category',
            all: { href: companiesHref(q, ''), active: !category },
            moreTitle: 'More categories',
            options: categories.map((tag) => ({
              key: tag.key,
              label: tag.label,
              count: tag.counts.companies,
              href: companiesHref(q, tag.slug),
              active: category === tag.slug,
            })),
          },
        ]}
        search={
          <CatalogSearch
            action="/companies"
            defaultValue={q}
            label="Search companies"
            params={{ category }}
            placeholder="Search companies…"
          />
        }
      />

      {sections.size === 0 ? (
        <NoResults
          clearHref="/companies"
          description={
            q
              ? `Nothing matches “${q}”. Try a different name or category.`
              : 'There are no companies in this category yet.'
          }
          title="No companies found"
        />
      ) : (
        <div className="flex flex-col gap-12">
          {[...sections.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([label, entries]) => (
              <CategorySection count={entries.length} key={label} title={label}>
                {entries.map(({ company, access }) => (
                  <CompanyRow
                    access={access.map((type) => type.toUpperCase())}
                    company={company}
                    key={company.key}
                  />
                ))}
              </CategorySection>
            ))}
        </div>
      )}
    </div>
  )
}
