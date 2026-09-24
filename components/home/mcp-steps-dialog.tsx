'use client'

import Image from 'next/image'

import {
  Sheet,
  SheetBackdrop,
  SheetDescription,
  SheetPopup,
  SheetPortal,
  SheetTitle,
} from '@/components/ui/sheet'
import { type Agent, MCP_URL } from './agents'

/** The long version of the card's two steps, for when the short one is not enough. */
export function McpStepsDialog({
  agent,
  open,
  onClose,
}: {
  agent: Agent
  open: boolean
  onClose: () => void
}) {
  return (
    <Sheet
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
      open={open}
    >
      <SheetPortal>
        <SheetBackdrop className="bg-background/60 backdrop-blur-sm" />
        <SheetPopup className="floating-panel fixed top-1/2 left-1/2 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col">
              <SheetTitle className="type-section">
                Connect with {agent.name}
              </SheetTitle>
              <SheetDescription className="type-body mt-1 text-foreground/60">
                Every step, in order.
              </SheetDescription>
            </div>

            {/* The agent's mark, in the same corner the card puts it. */}
            <span className="entity-shadow grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border bg-background">
              <Image
                alt=""
                className="size-6 object-contain"
                height={24}
                key={agent.logo}
                src={agent.logo}
                width={24}
              />
            </span>
          </div>

          <ol className="mt-5 flex flex-col gap-3">
            {agent.steps.map((step, index) => (
              <li className="flex items-start gap-3" key={step}>
                <span className="type-label grid size-6 shrink-0 place-items-center rounded-full bg-muted text-soft">
                  {index + 1}
                </span>
                <span className="type-body text-foreground">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded-xl border bg-surface px-4 py-3">
            <code className="type-label block truncate font-mono text-soft">
              {MCP_URL}
            </code>
          </div>
        </SheetPopup>
      </SheetPortal>
    </Sheet>
  )
}
