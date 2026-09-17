import { Search } from 'lucide-react'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { CompanyRow } from '@/components/catalog/cards'
import {
  EmptyState,
  Page,
  PillLink,
  SectionHeading,
} from '@/components/catalog/primitives'
import { CompanyRowsSkeleton } from '@/components/catalog/skeletons'
import {
  loadActiveTags,
  loadCompanies,
  searchCompanies,
} from '@/lib/catalog/loaders'

export const metadata: Metadata = {
  title: 'Companies',
  description:
    'The vendors, open-source projects and people who make the tools.',
}

type SearchParams = Promise<{
  q?: string | Array<string>
  category?: string | Array<string>
}>

function first(value: string | Array<string> | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? ''
}

export default function CompaniesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return (
    <Page className="flex flex-col gap-8">
      <SectionHeading
        as="h1"
        description="Grouped by what they make. Every company page lists its tools and the workflows that use them."
        title="Companies"
      />
      <Suspense fallback={<CompanyRowsSkeleton />}>
        <CompanyDirectory searchParams={searchParams} />
      </Suspense>
    </Page>
  )
}

async function CompanyDirectory({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const q = first(params.q).trim()
  const category = first(params.category).trim()
  if (!q) {
    await connection()
  }
  const [rows, tags] = await Promise.all([
    q ? searchCompanies(q) : loadCompanies(),
    loadActiveTags(),
  ])
  const categories = tags.filter(
    (tag) => tag.namespace === 'category' && tag.counts.companies > 0
  )
  const visible = category
    ? rows.filter((row) => row.category?.slug === category)
    : rows

  const sections = new Map<string, Array<(typeof rows)[number]>>()
  for (const row of visible) {
    const label = row.category?.label ?? 'Other'
    sections.set(label, [...(sections.get(label) ?? []), row])
  }

  const href = (nextCategory: string) => {
    const search = new URLSearchParams()
    if (q) {
      search.set('q', q)
    }
    if (nextCategory) {
      search.set('category', nextCategory)
    }
    const query = search.toString()
    return query ? `/companies?${query}` : '/companies'
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <PillLink active={!category} href={href('')}>
            All
          </PillLink>
          {categories.map((tag) => (
            <PillLink
              active={category === tag.slug}
              href={href(tag.slug)}
              key={tag.key}
            >
              {tag.label}
              <span className="text-[11px] opacity-60">
                {tag.counts.companies}
              </span>
            </PillLink>
          ))}
        </div>
        <form
          action="/companies"
          className="relative block w-full lg:w-72"
          method="get"
        >
          {category ? (
            <input name="category" type="hidden" value={category} />
          ) : null}
          <span className="sr-only">Search companies</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-foreground/55"
          />
          <input
            className="focus-ring h-10 w-full rounded-full border border-border bg-white pr-4 pl-10 text-sm placeholder:text-foreground/55"
            defaultValue={q}
            name="q"
            placeholder="Search companies…"
            type="search"
          />
        </form>
      </div>

      {sections.size === 0 ? (
        <EmptyState
          hint="Try another category or fewer words."
          title="No companies found"
        />
      ) : (
        [...sections.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([label, entries]) => (
            <section className="flex flex-col gap-5" key={label}>
              <div className="flex items-baseline gap-3">
                <h2 className="font-semibold text-lg tracking-[-0.02em]">
                  {label}
                </h2>
                <span className="font-medium text-foreground/55 text-xs">
                  {entries.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
                {entries.map(({ company, access }) => (
                  <CompanyRow
                    access={access.map((type) => type.toUpperCase())}
                    company={company}
                    key={company._id}
                  />
                ))}
              </div>
            </section>
          ))
      )}
    </div>
  )
}
