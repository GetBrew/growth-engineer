'use client'

import { useSearchParams } from 'next/navigation'
import { CompanyRow } from '@/components/catalog/cards'
import { CategorySection } from '@/components/catalog/category-section'
import { NoResults } from '@/components/common/no-results'
import { SectionHeading } from '@/components/layout/section-heading'
import { CatalogSearch } from '@/components/search/catalog-search'
import { ListingToolbar } from '@/components/search/listing-toolbar'
import {
  type CompanySearchItem,
  searchCompanyItems,
} from '@/lib/catalog/search'
import { useIsClient } from '@/lib/hooks/use-is-client'
import type { TagChip } from '@/lib/types/catalog'

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

type DirectoryProps = {
  companies: ReadonlyArray<CompanySearchItem>
  categories: ReadonlyArray<TagChip>
}

/** No query: what the prerendered page shows before the URL is read. */
const NO_PARAMS = new URLSearchParams()

/**
 * Every company, prerendered, narrowed by the URL in the browser: the
 * prerender draws the directory with no query (every company and link, fully
 * static); once hydrated it reads the URL and follows it.
 */
export function CompanyDirectory(props: DirectoryProps) {
  return useIsClient() ? (
    <CompanyDirectoryFromUrl {...props} />
  ) : (
    <CompanyDirectoryView {...props} params={NO_PARAMS} />
  )
}

function CompanyDirectoryFromUrl(props: DirectoryProps) {
  return <CompanyDirectoryView {...props} params={useSearchParams()} />
}

function CompanyDirectoryView({
  companies,
  categories,
  params: searchParams,
}: DirectoryProps & { params: URLSearchParams }) {
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
    <div className="flex flex-col gap-(--space-lg)">
      <SectionHeading
        description="Every company whose tools an agent can reach, and what each one does."
        title="Discover companies"
      />

      <div className="flex flex-col gap-(--space-3xl)">
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
          <div className="flex flex-col gap-(--space-3xl)">
            {[...sections.entries()]
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([label, entries]) => (
                <CategorySection
                  count={entries.length}
                  key={label}
                  title={label}
                >
                  {entries.map(({ company }) => (
                    <CompanyRow company={company} key={company.key} />
                  ))}
                </CategorySection>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
