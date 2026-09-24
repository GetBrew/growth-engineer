import Link from 'next/link'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { buttonVariants } from '@/components/ui/button'

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
