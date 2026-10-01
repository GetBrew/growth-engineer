'use client'

import {
  Copy01Icon,
  SparklesIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import { useCopy } from '@/lib/hooks/use-copy'
import {
  aiPrompt,
  closeSteps,
  openSteps,
  useSelectedAgent,
  useStepsOpen,
} from '@/lib/stores/agents'
import { AgentSwitcher } from './agent-switcher'
import { McpStepsDialog } from './mcp-steps-dialog'

export function McpCard({ url }: { url: string }) {
  const agent = useSelectedAgent()
  const urlCopy = useCopy()
  const prompt = useCopy()
  const showSteps = useStepsOpen()

  return (
    <div className="flex w-full max-w-104 flex-col gap-4 rounded-3xl border border-border bg-background p-5 lg:shrink-0">
      <div className="flex items-center justify-between gap-3">
        <span className="type-item">
          Connect with {agent.headline ?? agent.name}
        </span>
        <AgentSwitcher />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="type-helper whitespace-nowrap text-soft">
              Add this connection URL
            </span>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                className="rounded-full"
                onClick={() => prompt.copy(aiPrompt(agent, url))}
                size="xs"
                variant="secondary"
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  icon={prompt.copied ? Tick02Icon : SparklesIcon}
                  size={12}
                  strokeWidth={1.8}
                />
                {prompt.copied ? 'Copied' : 'Prompt'}
              </Button>

              <Button
                className="rounded-full"
                onClick={openSteps}
                size="xs"
                variant="secondary"
              >
                Manual
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-muted px-3.5 py-2.5">
            <code className="type-label min-w-0 flex-1 truncate">{url}</code>
            <Button
              className="rounded-lg text-soft hover:bg-transparent hover:text-foreground"
              onClick={() => urlCopy.copy(url)}
              size="icon-sm"
              variant="ghost"
            >
              <HugeiconsIcon
                aria-hidden="true"
                icon={urlCopy.copied ? Tick02Icon : Copy01Icon}
                size={16}
                strokeWidth={1.8}
              />
              <span className="sr-only">
                {urlCopy.copied ? 'Copied' : 'Copy the server URL'}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <McpStepsDialog
        agent={agent}
        onClose={closeSteps}
        open={showSteps}
        url={url}
      />
    </div>
  )
}
