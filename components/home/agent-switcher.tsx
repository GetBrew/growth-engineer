'use client'

import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { stepAgent, useSelectedAgent } from '@/lib/stores/agents'
import { cn } from '@/lib/utils/cn'

const NAV = 'rounded-lg text-faint hover:bg-hover hover:text-foreground'

/**
 * ‹ the agent's logo ›: steps through the agents, on the connect card and in
 * its steps dialog alike, so the dialog can move to the next agent without
 * being closed and opened again.
 */
export function AgentSwitcher({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const agent = useSelectedAgent()
  const isMd = size === 'md'
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        aria-label="Previous agent"
        className={NAV}
        onClick={() => stepAgent(-1)}
        size="icon-sm"
        variant="ghost"
      >
        <HugeiconsIcon
          aria-hidden="true"
          icon={ArrowLeft01Icon}
          size={16}
          strokeWidth={2}
        />
      </Button>

      <span
        className={cn(
          'entity-shadow grid shrink-0 place-items-center overflow-hidden rounded-xl border bg-background',
          isMd ? 'size-10' : 'size-8'
        )}
      >
        <Image
          alt=""
          className={cn('object-contain', isMd ? 'size-6' : 'size-5')}
          height={isMd ? 24 : 20}
          key={agent.logo}
          loading="eager"
          src={agent.logo}
          width={isMd ? 24 : 20}
        />
      </span>

      <Button
        aria-label="Next agent"
        className={NAV}
        onClick={() => stepAgent(1)}
        size="icon-sm"
        variant="ghost"
      >
        <HugeiconsIcon
          aria-hidden="true"
          icon={ArrowRight01Icon}
          size={16}
          strokeWidth={2}
        />
      </Button>
    </div>
  )
}
