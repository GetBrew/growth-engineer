import { Menu, Search, X } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { BrandMark } from './brand'
import { NAV_ITEMS } from './nav-items'
import { NavLinks, NavLinksStatic } from './nav-links'

/**
 * The site header, a Server Component. The only request-time read (the
 * active link) is isolated in <NavLinks> behind Suspense; the search box is a
 * plain GET form, so the URL is the query and no JavaScript is needed to
 * search.
 */
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-black/8 border-b bg-white/92 backdrop-blur-xl">
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
              className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-foreground/50"
            />
            <input
              autoComplete="off"
              className="focus-ring h-11 w-full rounded-full border-0 bg-black/5 pr-5 pl-11 text-foreground text-sm placeholder:text-foreground/45"
              name="q"
              placeholder="Search tools, or type has:mcp"
              type="search"
            />
          </label>
        </form>

        <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
          <Link
            className="focus-ring flex h-10 items-center rounded-full border border-black/10 bg-white px-4 font-medium text-sm transition-colors hover:bg-black/[0.04]"
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

        {/* No JavaScript: <details> is the menu. */}
        <details className="group/menu relative ml-auto lg:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-black/10 bg-white transition-colors hover:bg-black/[0.04] [&::-webkit-details-marker]:hidden">
            <Menu
              aria-hidden="true"
              className="size-5 group-open/menu:hidden"
            />
            <X
              aria-hidden="true"
              className="hidden size-5 group-open/menu:block"
            />
            <span className="sr-only">Toggle navigation menu</span>
          </summary>
          <div className="absolute top-12 right-0 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-black/8 bg-white p-2 shadow-[0_18px_50px_rgb(0_0_0/0.10)]">
            <form action="/tools" className="relative mb-2 block" method="get">
              <span className="sr-only">Search tools</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-foreground/50"
              />
              <input
                className="h-11 w-full rounded-full border-0 bg-black/5 pr-4 pl-11 text-sm placeholder:text-foreground/45"
                name="q"
                placeholder="Search tools"
                type="search"
              />
            </form>
            <nav aria-label="Mobile" className="grid">
              {NAV_ITEMS.map((item) => (
                <Link
                  className="rounded-xl px-4 py-3 font-medium text-foreground/75 text-sm hover:bg-black/[0.04] hover:text-foreground"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                className="rounded-xl px-4 py-3 font-medium text-foreground/75 text-sm hover:bg-black/[0.04] hover:text-foreground"
                href="/sign-in"
              >
                Sign in
              </Link>
              <Link
                className="mt-1 rounded-xl bg-foreground px-4 py-3 text-center font-medium text-background text-sm"
                href="/submit"
              >
                Submit a workflow
              </Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  )
}
