'use client'

import { useSearchParams } from 'next/navigation'
import { CompanyRow } from '@/components/catalog/cards'
import {
  CategorySection,
  withExpandedView,
} from '@/components/catalog/category-section'
import { NoResults } from '@/components/common/no-results'
import { SectionHeading } from '@/components/layout/section-heading'
import { FilterSearch } from '@/components/search/filter-search'
import { tagFilterOptions } from '@/lib/catalog/filter-suggestions'
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

/** What the box offers before anything is typed: the busiest categories. */
const COMPANY_EMPTY = { kinds: ['category'], limit: 8 } as const

type DirectoryProps = {
  companies: ReadonlyArray<CompanySearchItem>
  categories: ReadonlyArray<TagChip>
}

const NO_PARAMS = new URLSearchParams()

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

  const options = tagFilterOptions(
    categories,
    (key) => categories.find((tag) => tag.key === key)?.counts.companies ?? 0
  )
  const active = options.filter(
    (option) => option.key === `category:${category}`
  )
  const isExpanded = searchParams.get('view') === 'all'

  const sections = new Map<
    string,
    { label: string; slug?: string; rows: Array<CompanySearchItem> }
  >()
  for (const row of rows) {
    const id = row.category?.slug ?? ''
    const section = sections.get(id) ?? {
      label: row.category?.label ?? 'Other',
      slug: row.category?.slug,
      rows: [],
    }
    section.rows.push(row)
    sections.set(id, section)
  }

  return (
    <div className="flex flex-col gap-(--space-lg)">
      <SectionHeading
        as="h1"
        description="The companies that make the tools, grouped by what they do."
        title="Discover companies"
      />

      <div className="flex flex-col gap-(--space-3xl)">
        <FilterSearch
          action="/companies"
          active={active}
          clearHref="/companies"
          defaultValue={q}
          empty={COMPANY_EMPTY}
          label="Search companies"
          options={options}
          params={{ category: category || undefined }}
          // A company has one category: picking another replaces it.
          pickHref={(option, words) =>
            companiesHref(words, option.key.slice('category:'.length))
          }
          placeholder={`Search ${companies.length} companies`}
          removeHref={() => companiesHref(q, '')}
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
            {[...sections.values()]
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((section) => (
                <CategorySection
                  noun="companies"
                  entries={section.rows.map(({ company }) => ({
                    key: company.key,
                    name: company.name,
                    logo: company,
                    row: <CompanyRow company={company} />,
                  }))}
                  isExpanded={isExpanded}
                  key={section.label}
                  moreHref={
                    section.slug
                      ? withExpandedView(companiesHref(q, section.slug))
                      : undefined
                  }
                  title={section.label}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
