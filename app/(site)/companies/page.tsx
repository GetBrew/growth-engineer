import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HeroBanner } from '@/components/catalog/hero-banner'
import { Page, SectionHeading } from '@/components/catalog/primitives'
import { HeroActions } from '@/components/catalog/works-with-agents'
import { CompanyDirectory } from '@/components/companies/company-directory'
import { CompaniesSkeleton } from '@/components/skeletons/companies-skeleton'
import { buttonVariants } from '@/components/ui/button'
import { loadCompanySearchItems, loadTagChips } from '@/lib/catalog/loaders'

export const metadata: Metadata = {
  title: 'Companies',
  description:
    'The vendors, open-source projects and people who make the tools.',
}

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
  return <CompanyDirectory categories={categories} companies={companies} />
}
