import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <a
        className="focus-ring sr-only rounded-full bg-foreground px-4 py-2 text-background focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100]"
        href="#main"
      >
        Skip to content
      </a>
      <Navbar />
      <main className="flex-1" id="main">
        {children}
      </main>
      <Footer />
    </div>
  )
}
