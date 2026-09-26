import type { Metadata } from 'next'
import { HeroBanner } from '@/components/common/hero-banner'
import { HomeCatalog } from '@/components/home/catalog'
import { Definitions } from '@/components/home/definitions'
import { FounderProof } from '@/components/home/founder-proof'
import { SITE } from '@/lib/catalog/definitions'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = {
  ...pageMetadata({
    title: SITE.name,
    description: SITE.tagline,
    path: '/',
  }),
  // The root template would print the name twice.
  title: { absolute: `${SITE.name} — ${SITE.tagline}` },
}

export default function HomePage() {
  return (
    <>
      <HeroBanner title="See how real growth teams get things done" />

      <HomeCatalog />
      <Definitions />
      <FounderProof />
    </>
  )
}
