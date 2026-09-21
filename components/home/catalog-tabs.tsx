'use client'

import Link from 'next/link'
import { type ReactNode, useState } from 'react'

import { MaskIcon } from '@/components/site/mask-icon'
import { buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type CatalogTab = {
  value: string
  label: string
  icon: string
  content: ReactNode
}

export function CatalogTabs({ tabs }: { tabs: ReadonlyArray<CatalogTab> }) {
  const [active, setActive] = useState(tabs[0]?.value)

  return (
    <Tabs
      className="gap-8"
      onValueChange={(value) => setActive(String(value))}
      value={active}
    >
      {/* Tabs + Submit button */}
      <div className="flex items-center justify-between gap-4">
        <TabsList aria-label="Browse the catalog">
          {tabs.map((tab) => (
            <TabsTrigger
              className="flex-none gap-2"
              key={tab.value}
              value={tab.value}
            >
              <MaskIcon size={16} src={tab.icon} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <Link className={buttonVariants({ size: 'pill' })} href="/submit">
          Submit a workflow
        </Link>
      </div>

      {/* Tab content */}
      {tabs.map((tab) => (
        <TabsContent keepMounted key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
