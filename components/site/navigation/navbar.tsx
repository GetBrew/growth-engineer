import { Search } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { BrandMark } from './brand'
import { MobileMenu } from './mobile-menu'
import { NavLinks, NavLinksStatic } from './nav-links'

/**
 * The site header, a Server Component. The only request-time read (the
 * active link) is isolated in <NavLinks> behind Suspense; the search box is a
 * plain GET form, so the URL is the query and no JavaScript is needed to
 * search. The header is FIXED below `lg` — the mobile menu is a sheet that
 * hangs off it — and sticky above, so a spacer replaces its height on the
 * small screens where it leaves the flow.
 */
export function Navbar() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-border border-b bg-white/92 backdrop-blur-xl lg:sticky">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:h-20 sm:px-6 xl:px-7">
          <BrandMark />

          <Suspense fallback={<NavLinksStatic />}>
            <NavLinks />
          </Suspense>

          <form
            action="/tools"
            className="relative mx-auto hidden w-[320px] shrink-0 lg:block"
            method="get"
          >
            <label className="relative block">
              <span className="sr-only">Search tools, workflows and tags</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-foreground/62"
              />
              <input
                autoComplete="off"
                className="focus-ring h-10 w-full rounded-full border-0 bg-black/5 pr-4 pl-11 text-foreground text-sm placeholder:text-foreground/55"
                name="q"
                placeholder="Search tools, or type has:mcp"
                type="search"
              />
            </label>
          </form>

          <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
            <Link
              className="focus-ring flex h-10 items-center rounded-full border border-border bg-white px-4 font-medium text-sm transition-colors hover:bg-black/[0.04]"
              href="/sign-in"
            >
              Sign in
            </Link>
            <Link
              className="focus-ring flex h-10 items-center rounded-full bg-foreground px-4 font-medium text-background text-sm transition-colors hover:bg-black/80"
              href="/submit"
            >
              Submit a workflow
            </Link>
          </div>

          <MobileMenu />
        </div>
      </header>
      <div aria-hidden="true" className="h-16 shrink-0 sm:h-20 lg:hidden" />
    </>
  )
}
