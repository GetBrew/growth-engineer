import type { ReactNode } from 'react'
import { Footer } from '@/components/site/footer'
import { Navbar } from '@/components/site/navigation/navbar'

/**
 * The public site: every page shares this chrome. The route group carries no
 * security meaning — there is no auth — only the layout.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
