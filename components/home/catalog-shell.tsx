import type { ReactNode } from 'react'
import { SectionHeading } from '@/components/layout/section-heading'

export function CatalogShell({ children }: { children: ReactNode }) {
  return (
    <section className="page-container pt-8 sm:pt-14">
      <SectionHeading
        description="Workflows, the tools they run on, and the companies behind them."
        title="Explore the catalog"
      />
      <div className="mt-(--space-lg)">{children}</div>
    </section>
  )
}
