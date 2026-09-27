'use client'

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Copy01Icon,
  SparklesIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useCopy } from '@/lib/hooks/use-copy'
import {
  AGENTS,
  aiPrompt,
  closeSteps,
  openSteps,
  selectAgent,
  useSelectedAgent,
  useStepsOpen,
} from '@/lib/stores/agents'
import { McpStepsDialog } from './mcp-steps-dialog'

/**
 * The connection card: pick an agent, copy the server URL, or copy a prompt
 * that asks the agent to connect itself. `url` is the deployment's own
 * `/mcp` (app/mcp/route.ts), passed from the server so it is the origin the
 * page was built for — never a hardcoded host.
 */
/** The previous / next agent arrows: quiet until hovered. */
const NAV = 'rounded-lg text-faint hover:bg-hover hover:text-foreground'

export function McpCard({ url }: { url: string }) {
  const agent = useSelectedAgent()
  const urlCopy = useCopy()
  const prompt = useCopy()
  const showSteps = useStepsOpen()

  function step(by: number) {
    const at = AGENTS.findIndex((one) => one.name === agent.name)
    const next = AGENTS[(at + by + AGENTS.length) % AGENTS.length]
    if (next) {
      selectAgent(next)
    }
  }

  return (
    <div className="flex w-full max-w-[26rem] flex-col gap-4 rounded-3xl border border-border bg-background p-5 lg:shrink-0">
      <div className="flex items-center justify-between gap-3">
        <span className="type-item">
          Connect with {agent.headline ?? agent.name}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            aria-label="Previous agent"
            className={NAV}
            onClick={() => step(-1)}
            size="icon-sm"
            variant="ghost"
          >
            <HugeiconsIcon
              aria-hidden="true"
              className="size-[15px]"
              icon={ArrowLeft01Icon}
              size={15}
              strokeWidth={2}
            />
          </Button>

          <span className="entity-shadow grid size-8 shrink-0 place-items-center overflow-hidden rounded-xl border bg-background">
            <Image
              alt=""
              className="size-5 object-contain"
              height={20}
              key={agent.logo}
              loading="eager"
              src={agent.logo}
              width={20}
            />
          </span>

          <Button
            aria-label="Next agent"
            className={NAV}
            onClick={() => step(1)}
            size="icon-sm"
            variant="ghost"
          >
            <HugeiconsIcon
              aria-hidden="true"
              className="size-[15px]"
              icon={ArrowRight01Icon}
              size={15}
              strokeWidth={2}
            />
          </Button>
        </div>
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
              className="rounded-lg text-muted-foreground hover:bg-transparent hover:text-foreground"
              onClick={() => urlCopy.copy(url)}
              size="icon-sm"
              variant="ghost"
            >
              <HugeiconsIcon
                aria-hidden="true"
                className="size-[15px]"
                icon={urlCopy.copied ? Tick02Icon : Copy01Icon}
                size={15}
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
