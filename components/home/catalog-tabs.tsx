'use client'

import { type ReactNode, useState } from 'react'
import { EntityIcon, type EntityKind } from '@/components/catalog/entity-icon'
import { CatalogSearch } from '@/components/search/catalog-search'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type CatalogTab = {
  value: string
  label: string
  entity: EntityKind

  href: string
  content: ReactNode
}

export function CatalogTabs({ tabs }: { tabs: ReadonlyArray<CatalogTab> }) {
  const [active, setActive] = useState(tabs[0]?.value)

  const activeTab = tabs.find((tab) => tab.value === active) ?? tabs[0]
  const subject = activeTab?.label.toLowerCase() ?? 'the catalog'

  return (
    <Tabs
      /* The list rows carry 20px of their own top padding, so 4 here reads
         as the same 24px this section spaces everything by. */
      className="gap-1"
      onValueChange={(value) => setActive(String(value))}
      value={active}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <TabsList aria-label="Browse the catalog" className="w-full sm:w-fit">
          {tabs.map((tab) => (
            <TabsTrigger
              className="min-w-0 gap-1.5 px-2 sm:flex-none sm:gap-2 sm:px-4"
              key={tab.value}
              value={tab.value}
            >
              <EntityIcon entity={tab.entity} size={16} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {activeTab ? (
          <CatalogSearch
            action={activeTab.href}
            className="w-full sm:max-w-xs"
            key={activeTab.value}
            label={`Search ${subject}`}
            placeholder={`Search ${subject}`}
          />
        ) : null}
      </div>

      {tabs.map((tab) => (
        <TabsContent keepMounted key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
