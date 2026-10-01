'use client'

import { CodeText } from '@/components/common/code-text'
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
import { AgentSwitcher } from './agent-switcher'

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

            {/* Switch agents here, without closing and reopening. */}
            <AgentSwitcher size="md" />
          </div>

          <ol className="mt-5 flex flex-col gap-3">
            {agent.steps.map((step, index) => (
              <li className="flex items-start gap-3" key={step}>
                <span className="type-label grid size-6 shrink-0 place-items-center rounded-full bg-muted text-soft">
                  {index + 1}
                </span>
                <span className="type-body min-w-0 break-words text-foreground">
                  <CodeText text={stepWithUrl(step, url)} />
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded-xl border bg-surface px-4 py-3">
            <code className="type-label block truncate font-mono text-soft">
              {url}
            </code>
          </div>

          {/* The client's own guide, quietly, for when its screens have
              moved on before these steps have. */}
          <div className="mt-5 flex items-center justify-between gap-4">
            {/* Smaller than the steps, and only the link underlined: a label,
                then where it goes. */}
            <p className="type-label text-soft">
              Need help?{' '}
              <a
                className="focus-ring rounded-sm text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
                href={agent.guide}
                rel="noreferrer"
                target="_blank"
              >
                Official guide
              </a>
            </p>
            <SheetClose render={<Button size="pill" variant="outline" />}>
              Done
            </SheetClose>
          </div>
        </SheetPopup>
      </SheetPortal>
    </Sheet>
  )
}
