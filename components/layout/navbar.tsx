import Link from 'next/link'
import { GithubLink } from '@/components/layout/github-link'
import { NavSearchButton } from '@/components/layout/nav-search-button'
import { CommandPalette } from '@/components/search/command-palette'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="page-container flex h-header items-center">
        <Link className="focus-ring type-item rounded-sm" href="/">
          growth.engineer
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <NavSearchButton />
          <GithubLink compact />
        </div>
      </div>

      <CommandPalette />
    </header>
  )
}
