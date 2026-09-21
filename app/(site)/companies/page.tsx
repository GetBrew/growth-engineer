import type { Metadata } from 'next'
import { Suspense } from 'react'
import { HeroBanner } from '@/components/catalog/hero-banner'
import { Page, SectionHeading } from '@/components/catalog/primitives'
import { HeroActions } from '@/components/catalog/works-with-agents'
import {
  type CompaniesSearchParams,
  CompanyDirectory,
} from '@/components/companies/company-directory'
import { CompaniesSkeleton } from '@/components/skeletons/companies-skeleton'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Companies',
  description:
    'The vendors, open-source projects and people who make the tools.',
}

export default function CompaniesPage({
  searchParams,
}: {
  searchParams: CompaniesSearchParams
}) {
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
            href="mailto:founders@brew.new"
          >
            List your company
          </a>
        </HeroActions>
      </HeroBanner>
      <Page className="flex flex-col gap-8">
        <SectionHeading
          description="Tools used to build and run modern growth workflows."
          title="Discover companies"
        />
        <Suspense fallback={<CompaniesSkeleton />}>
          <CompanyDirectory searchParams={searchParams} />
        </Suspense>
      </Page>
    </>
  )
}
