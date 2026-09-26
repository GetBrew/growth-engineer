import { Suspense } from 'react'
import { BrandLockup } from '@/components/layout/brand'
import {
  BrowseMenu,
  BrowseMenuFallback,
  SectionLinks,
  SectionLinksFallback,
} from '@/components/layout/browse-nav'
import { GithubLink } from '@/components/layout/github-link'
import { NavSearchButton } from '@/components/layout/nav-search-button'
import { CommandPalette } from '@/components/search/command-palette'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="page-container flex h-header items-center">
        <BrandLockup markOnlyOnNarrow />

        <Suspense fallback={<SectionLinksFallback />}>
          <SectionLinks />
        </Suspense>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Suspense fallback={<BrowseMenuFallback />}>
            <BrowseMenu />
          </Suspense>
          <NavSearchButton />
          <GithubLink compact />
        </div>
      </div>

      <CommandPalette />
    </header>
  )
}
