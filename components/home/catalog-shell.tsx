import type { ReactNode } from 'react'

export function CatalogShell({ children }: { children: ReactNode }) {
  return <section className="page-container pt-11">{children}</section>
}
