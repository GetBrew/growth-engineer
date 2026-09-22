import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HeroBanner } from '@/components/catalog/hero-banner'
import { Page, SectionHeading } from '@/components/catalog/primitives'
import { HeroActions } from '@/components/catalog/works-with-agents'
import { CompanyDirectory } from '@/components/companies/company-directory'
import { JsonLd } from '@/components/seo/json-ld'
import { CompaniesSkeleton } from '@/components/skeletons/companies-skeleton'
import { buttonVariants } from '@/components/ui/button'
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
      <HeroBanner
        description="Meet the teams building the tools behind modern growth work."
        eyebrow="Companies"
        icon="/company.svg"
        title="Companies behind the tools"
      >
        <HeroActions>
          <a
            className={buttonVariants({ size: 'pill' })}
            href="https://github.com/GetBrew/growth-engineer/blob/main/CONTRIBUTING.md"
            rel="noreferrer"
            target="_blank"
          >
            Add your company
          </a>
        </HeroActions>
      </HeroBanner>
      <Page className="flex flex-col gap-8">
        <SectionHeading
          description="Tools used to build and run modern growth workflows."
          title="Discover companies"
        />
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
