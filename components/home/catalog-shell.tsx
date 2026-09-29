import type { ReactNode } from 'react'

/**
 * The home page's catalog: no heading of its own — the hero above already
 * says what the site is, so the Workflows / Tools / Companies tabs open it,
 * as close under the agents strip as the strip is under the hero.
 */
export function CatalogShell({ children }: { children: ReactNode }) {
  return <section className="page-container pt-2">{children}</section>
}
