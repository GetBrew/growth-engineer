'use client'

import type { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Section = {
  value: string
  label: string
  count?: number
  content: ReactNode
}

/**
 * A detail page's sections as tabs: a side menu on desktop, a scrolling
 * row on phones. Every panel stays mounted, so the full page is in the HTML
 * for agents and search, not only the open tab.
 */
export function DetailTabs({
  label,
  sections,
}: {
  /** What the tab list is, for screen readers: "Company sections". */
  label: string
  sections: ReadonlyArray<Section>
}) {
  return (
    <Tabs
      className="grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-14"
      defaultValue={sections[0]?.value}
      orientation="vertical"
    >
      <TabsList
        aria-label={label}
        className="scrollbar-none h-auto w-full justify-start gap-1 overflow-x-auto rounded-none bg-transparent p-0 group-data-vertical/tabs:flex-row group-data-vertical/tabs:p-0 lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:gap-0.5 lg:self-start lg:group-data-vertical/tabs:flex-col"
        variant="plain"
      >
        {sections.map((section) => (
          <TabsTrigger
            className="h-auto flex-none justify-between gap-3 rounded-xl px-3 py-2 hover:bg-hover data-active:bg-hover data-active:text-foreground group-data-vertical/tabs:w-auto group-data-vertical/tabs:justify-between lg:group-data-vertical/tabs:w-full"
            key={section.value}
            value={section.value}
          >
            {section.label}
            {section.count === undefined ? null : (
              <span className="type-meta tabular-nums">{section.count}</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {sections.map((section) => (
        <TabsContent keepMounted key={section.value} value={section.value}>
          {section.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
