import type { ReactNode } from 'react'
import { Footer } from '@/components/site/footer'
import { Navbar } from '@/components/site/navigation/navbar'

/**
 * The public site: every page, including the home page and the signed-in
 * `/submit`, shares this chrome. Auth is decided by path in proxy.ts, so the
 * route group carries no security meaning — only the layout.
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
