import Link from 'next/link'
import { Footer } from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

/**
 * The root not-found renders outside every route group, so it mounts the site
 * chrome itself. A missing key is a 404 with the same navigation as any page:
 * agents and people alike land somewhere useful.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h1 className="font-semibold text-2xl tracking-[-0.03em]">Not found</h1>
        <p className="max-w-md text-foreground/62 text-sm leading-6">
          No company, tool or workflow lives at this address. Keys are
          permanent, so if a link once worked it has an alias — or it never
          existed.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'rounded-full'
            )}
            href="/tools"
          >
            Browse tools
          </Link>
          <Link
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'rounded-full'
            )}
            href="/workflows"
          >
            Browse workflows
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
