import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CompanyDirectory } from '@/components/catalog/company-directory'
import { HeroBanner } from '@/components/catalog/hero-banner'
import { Page } from '@/components/layout/primitives'
import { CompaniesSkeleton } from '@/components/skeletons/companies-skeleton'
import { loadCompanySearchItems, loadTagChips } from '@/lib/catalog/loaders'

export const metadata: Metadata = {
  title: 'Companies',
  description:
    'The vendors, open-source projects and people who make the tools.',
}

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
  return <CompanyDirectory categories={categories} companies={companies} />
}
