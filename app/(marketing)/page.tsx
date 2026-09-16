import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

/**
 * A fully static page: no `auth()`, no data reads, nothing request-shaped. It
 * prerenders to HTML at build time and is served from the edge cache.
 *
 * The signed-in/signed-out header split deliberately is NOT here — putting it
 * in the shell would make this route dynamic. Auth-dependent chrome belongs in
 * the (app) group, or behind its own `<Suspense>` boundary.
 *
 * The links carry `buttonVariants(...)` rather than wrapping a <Link> in a
 * <button>: nesting an anchor inside a button is invalid HTML and breaks
 * keyboard activation.
 */
export default function MarketingPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-8 px-6 py-24">
      <div className="flex flex-col gap-4">
        <h1 className="text-balance font-semibold text-4xl tracking-tight sm:text-5xl">
          Next.js, Convex, and Clerk — wired the way you would wire it the
          second time.
        </h1>
        <p className="text-balance text-lg text-muted-foreground">
          Authorization by construction, a hermetic test suite, and CI that
          blocks on more than <code className="font-mono text-base">tsc</code>.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link className={cn(buttonVariants())} href="/sign-up">
          Get started
        </Link>
        <Link
          className={cn(buttonVariants({ variant: 'outline' }))}
          href="/dashboard"
        >
          Open the dashboard
        </Link>
      </div>
    </main>
  )
}
