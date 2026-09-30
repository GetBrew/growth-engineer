'use client'

import Image from 'next/image'

import { Button } from '@/components/ui/button'
import {
  DIALOG_BACKDROP,
  DIALOG_POPUP,
  Sheet,
  SheetBackdrop,
  SheetClose,
  SheetDescription,
  SheetPopup,
  SheetPortal,
  SheetTitle,
} from '@/components/ui/sheet'
import { type Agent, stepWithUrl } from '@/lib/stores/agents'
import { cn } from '@/lib/utils/cn'

export function McpStepsDialog({
  agent,
  open,
  onClose,
  url,
}: {
  agent: Agent
  open: boolean
  onClose: () => void
  url: string
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
        <SheetBackdrop className={DIALOG_BACKDROP} />
        <SheetPopup className={cn(DIALOG_POPUP, 'max-w-lg p-6')}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col">
              <SheetTitle className="type-section">
                Connect with {agent.name}
              </SheetTitle>
              <SheetDescription className="mt-1">
                Every step, in order.
              </SheetDescription>
            </div>

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
                <span className="type-body min-w-0 break-words text-foreground">
                  {stepWithUrl(step, url)}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded-xl border bg-surface px-4 py-3">
            <code className="type-label block truncate font-mono text-soft">
              {url}
            </code>
          </div>

          <div className="mt-5 flex justify-end">
            <SheetClose render={<Button size="pill" variant="outline" />}>
              Done
            </SheetClose>
          </div>
        </SheetPopup>
      </SheetPortal>
    </Sheet>
  )
}
