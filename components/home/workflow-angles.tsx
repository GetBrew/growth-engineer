'use client'

import { type ReactNode, useState } from 'react'
import { pillClass } from '@/components/search/pill-link'

type Panel = { value: string; label: string; content: ReactNode }

/**
 * The home page's workflows from one angle at a time — New, Hot, Popular.
 * Every panel is rendered and kept mounted, so the counted ones stream in
 * with the page and switching never waits.
 */
export function WorkflowAngles({ panels }: { panels: ReadonlyArray<Panel> }) {
  const [active, setActive] = useState(panels[0]?.value)
  return (
    <div className="flex flex-col">
      <fieldset className="flex min-w-0 flex-wrap gap-2 pt-4">
        <legend className="sr-only">Order workflows</legend>
        {panels.map((panel) => (
          <button
            aria-pressed={panel.value === active}
            className={pillClass(panel.value === active)}
            key={panel.value}
            onClick={() => setActive(panel.value)}
            type="button"
          >
            {panel.label}
          </button>
        ))}
      </fieldset>
      {panels.map((panel) => (
        <div hidden={panel.value !== active} key={panel.value}>
          {panel.content}
        </div>
      ))}
    </div>
  )
}
