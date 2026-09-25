import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CompanyDirectory } from '@/components/catalog/company-directory'
import { HeroBanner } from '@/components/common/hero-banner'
import { Page } from '@/components/layout/page'
import { JsonLd } from '@/components/seo/json-ld'
import { CompaniesSkeleton } from '@/components/skeletons/companies-skeleton'
import { loadCompanySearchItems, loadTagChips } from '@/lib/catalog/loaders'
import { SITE_ORIGIN } from '@/lib/env'
import { pageMetadata } from '@/lib/seo/metadata'
import { collectionJsonLd, listingItems } from '@/lib/seo/structured-data'

const PAGE = {
  path: '/companies',
  name: 'Companies',
  description:
    'The vendors, open-source projects and people who make the tools.',
}

export const metadata: Metadata = pageMetadata({
  title: PAGE.name,
  description: PAGE.description,
  path: PAGE.path,
})

/** Prerendered in full; the directory narrows itself in the browser. */
export default function CompaniesPage() {
  return (
    <>
      <HeroBanner title="The companies behind the tools" />
      <Page>
        <Suspense fallback={<CompaniesSkeleton />}>
          <Directory />
        </Suspense>
      </Page>
    </>
  )
}

async function Directory() {
  const [companies, tags] = await Promise.all([
    loadCompanySearchItems(),
    loadTagChips(),
  ])
  const categories = tags.filter(
    (tag) => tag.namespace === 'category' && tag.counts.companies > 0
  )
  return (
    <>
      <JsonLd
        data={collectionJsonLd(SITE_ORIGIN, PAGE, listingItems(companies))}
      />
      <CompanyDirectory categories={categories} companies={companies} />
    </>
  )
}
