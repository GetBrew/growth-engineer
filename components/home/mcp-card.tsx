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
import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { MCP_URL } from '@/lib/constants/site'
import {
  AGENTS,
  type Agent,
  aiPrompt,
  closeSteps,
  openSteps,
  selectAgent,
  useSelectedAgent,
  useStepsOpen,
} from '@/lib/stores/agents'
import { cn } from '@/lib/utils/cn'
import { McpStepsDialog } from './mcp-steps-dialog'

export function McpCard() {
  const agent = useSelectedAgent()
  const [copied, setCopied] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const showSteps = useStepsOpen()

  function step(by: number) {
    const at = AGENTS.findIndex((one) => one.name === agent.name)
    const next = AGENTS[(at + by + AGENTS.length) % AGENTS.length]
    if (next) {
      selectAgent(next)
    }
  }

  async function copyPrompt(current: Agent) {
    await navigator.clipboard
      .writeText(aiPrompt(current))
      .catch(() => undefined)
    setCopiedPrompt(true)
    window.setTimeout(() => setCopiedPrompt(false), 1800)
  }

  async function copy() {
    await navigator.clipboard.writeText(MCP_URL).catch(() => undefined)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="flex w-full max-w-[26rem] flex-col gap-4 rounded-3xl border border-border bg-background p-5 lg:shrink-0">
      <div className="flex items-center justify-between gap-3">
        <span className="type-item">
          Connect with {agent.headline ?? agent.name}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            aria-label="Previous agent"
            className="focus-ring grid size-7 place-items-center rounded-lg text-faint transition-colors duration-200 hover:bg-hover hover:text-foreground"
            onClick={() => step(-1)}
            type="button"
          >
            <HugeiconsIcon
              aria-hidden="true"
              icon={ArrowLeft01Icon}
              size={15}
              strokeWidth={2}
            />
          </button>

          <span className="entity-shadow grid size-8 shrink-0 place-items-center overflow-hidden rounded-xl border bg-background">
            <Image
              alt=""
              className="size-5 object-contain"
              height={20}
              key={agent.logo}
              src={agent.logo}
              width={20}
            />
          </span>

          <button
            aria-label="Next agent"
            className="focus-ring grid size-7 place-items-center rounded-lg text-faint transition-colors duration-200 hover:bg-hover hover:text-foreground"
            onClick={() => step(1)}
            type="button"
          >
            <HugeiconsIcon
              aria-hidden="true"
              icon={ArrowRight01Icon}
              size={15}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="type-helper whitespace-nowrap text-soft">
              Add this connection URL
            </span>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'xs' }),
                  'rounded-full'
                )}
                onClick={() => copyPrompt(agent)}
                type="button"
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  icon={copiedPrompt ? Tick02Icon : SparklesIcon}
                  size={12}
                  strokeWidth={1.8}
                />
                {copiedPrompt ? 'Copied' : 'Prompt'}
              </button>

              <button
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'xs' }),
                  'rounded-full'
                )}
                onClick={openSteps}
                type="button"
              >
                Manual
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-muted px-3.5 py-2.5">
            <code className="type-label min-w-0 flex-1 truncate">
              {MCP_URL}
            </code>
            <button
              className="focus-ring grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors duration-200 hover:text-foreground"
              onClick={copy}
              type="button"
            >
              <HugeiconsIcon
                aria-hidden="true"
                icon={copied ? Tick02Icon : Copy01Icon}
                size={15}
                strokeWidth={1.8}
              />
              <span className="sr-only">
                {copied ? 'Copied' : 'Copy the server URL'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <McpStepsDialog agent={agent} onClose={closeSteps} open={showSteps} />
    </div>
  )
}
