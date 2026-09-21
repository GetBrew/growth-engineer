import Link from 'next/link'
import { Suspense } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { AuthAction } from './auth-action'
import { SiteMenu } from './site-menu'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="page-container flex h-header items-center">
        <Link className="focus-ring type-item rounded-sm" href="/">
          growth.engineer
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Suspense
            fallback={
              <span
                aria-hidden="true"
                className={buttonVariants({
                  variant: 'outline',
                  size: 'pill',
                })}
              >
                Log in
              </span>
            }
          >
            <AuthAction />
          </Suspense>
          <Link className={buttonVariants({ size: 'pill' })} href="/">
            Talk to Founders
          </Link>
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
