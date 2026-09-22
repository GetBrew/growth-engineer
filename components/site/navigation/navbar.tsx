import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { SiteMenu } from './site-menu'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="page-container flex h-header items-center">
        <Link className="focus-ring type-item rounded-sm" href="/">
          growth.engineer
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <a
            className={buttonVariants({ size: 'pill' })}
            href="mailto:founders@brew.new"
          >
            Talk to founders
          </a>
        </div>

        <span
          aria-hidden="true"
          className="mx-2 h-8 border-l border-dashed sm:mx-4"
        />

        <SiteMenu />
      </div>
    </header>
  )
}
