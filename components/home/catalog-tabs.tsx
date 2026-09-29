'use client'

import { type ReactNode, useState } from 'react'
import { EntityIcon, type EntityKind } from '@/components/common/entity-icon'
import { CatalogSearch } from '@/components/search/catalog-search'
import { OrderMenu } from '@/components/search/order-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/** One way to order a tab's list, and what its search carries along. */
type CatalogView = {
  value: string
  label: string
  content: ReactNode
  params?: Record<string, string | undefined>
}

/**
 * A tab shows one list (`content`), or the same list in several orders
 * (`views`), picked from a dropdown beside the search box.
 */
export type CatalogTab = {
  value: string
  label: string
  entity: EntityKind

  href: string
} & (
  | { content: ReactNode; views?: undefined }
  | { views: ReadonlyArray<CatalogView>; content?: undefined }
)

export function CatalogTabs({ tabs }: { tabs: ReadonlyArray<CatalogTab> }) {
  const [active, setActive] = useState(tabs[0]?.value)
  const [viewOf, setViewOf] = useState<Record<string, string>>({})

  const activeTab = tabs.find((tab) => tab.value === active) ?? tabs[0]
  const subject = activeTab?.label.toLowerCase() ?? 'the catalog'
  const viewFor = (tab: CatalogTab) =>
    tab.views?.find((view) => view.value === viewOf[tab.value]) ??
    tab.views?.[0]
  const activeView = activeTab ? viewFor(activeTab) : undefined

  return (
    <Tabs
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
          <div className="flex w-full items-center gap-2 sm:w-auto">
            {activeTab.views && activeView ? (
              <OrderMenu
                onChange={(value) =>
                  setViewOf((views) => ({ ...views, [activeTab.value]: value }))
                }
                orders={activeTab.views}
                value={activeView.value}
              />
            ) : null}
            <CatalogSearch
              action={activeTab.href}
              className="min-w-0 flex-1 sm:w-80 sm:flex-none"
              key={activeTab.value}
              label={`Search ${subject}`}
              params={activeView?.params}
              placeholder={`Search ${subject}`}
            />
          </div>
        ) : null}
      </div>

      {/* Every view stays mounted, so the ones read at request time stream
          in with the page and switching never waits. */}
      {tabs.map((tab) => (
        <TabsContent keepMounted key={tab.value} value={tab.value}>
          {tab.views
            ? tab.views.map((view) => (
                <div
                  hidden={view.value !== viewFor(tab)?.value}
                  key={view.value}
                >
                  {view.content}
                </div>
              ))
            : tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
