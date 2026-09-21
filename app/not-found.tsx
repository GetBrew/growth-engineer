import Link from 'next/link'
import { Footer } from '@/components/site/footer'
import { Navbar } from '@/components/site/navigation/navbar'
import { buttonVariants } from '@/components/ui/button'

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
        <h1 className="type-page-title">Not found</h1>
        <p className="type-body max-w-md">
          No company, tool or workflow lives at this address. Keys are
          permanent, so if a link once worked it has an alias — or it never
          existed.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            className={buttonVariants({ variant: 'outline', size: 'pill' })}
            href="/tools"
          >
            Browse tools
          </Link>
          <Link
            className={buttonVariants({ variant: 'outline', size: 'pill' })}
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
