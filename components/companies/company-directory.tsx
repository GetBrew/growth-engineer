import { connection } from 'next/server'
import { CompanyRow } from '@/components/catalog/cards'
import { CatalogSearch } from '@/components/catalog/catalog-search'
import { CategorySection } from '@/components/catalog/category-section'
import { ListingToolbar } from '@/components/catalog/listing-toolbar'
import { NoResults } from '@/components/catalog/no-results'
import {
  loadActiveTags,
  loadCompanies,
  searchCompanies,
} from '@/lib/catalog/loaders'
import { firstParam } from '@/lib/catalog/query'

export type CompaniesSearchParams = Promise<{
  q?: string | Array<string>
  category?: string | Array<string>
}>

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
 * by category. Reads the URL, so it renders inside the page's Suspense.
 */
export async function CompanyDirectory({
  searchParams,
}: {
  searchParams: CompaniesSearchParams
}) {
  const params = await searchParams
  const q = firstParam(params.q).trim()
  const category = firstParam(params.category).trim()
  await connection()
  const [rows, tags] = await Promise.all([
    q
      ? searchCompanies(q, category || undefined)
      : loadCompanies(200, category || undefined),
    loadActiveTags(),
  ])
  const categories = tags.filter(
    (tag) => tag.namespace === 'category' && tag.counts.companies > 0
  )
  const sections = new Map<string, Array<(typeof rows)[number]>>()
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
                    key={company._id}
                  />
                ))}
              </CategorySection>
            ))}
        </div>
      )}
    </div>
  )
}
