import type { ReactNode } from 'react'
import { SectionHeading } from '@/components/catalog/primitives'

export function CatalogShell({ children }: { children: ReactNode }) {
  return (
    <section className="page-container pt-14 pb-24">
      <SectionHeading
        description="Workflows that put tools to work, the tools they run on, and the companies behind them."
        title="Explore the catalog"
      />
      <div className="mt-8">{children}</div>
    </section>
  )
}
