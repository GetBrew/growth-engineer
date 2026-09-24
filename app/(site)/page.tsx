import { Suspense } from 'react'
import { HeroBanner } from '@/components/catalog/hero-banner'
import { FounderProof } from '@/components/home/founder-proof'
import { HomeCatalog } from '@/components/home/home-catalog'
import { HomeSkeleton } from '@/components/skeletons/home-skeleton'

export default function HomePage() {
  return (
    <>
      <HeroBanner title="See how real growth teams get things done" />

      <Suspense fallback={<HomeSkeleton />}>
        <HomeCatalog />
      </Suspense>
      <FounderProof />
    </>
  )
}
