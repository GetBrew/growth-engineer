'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AGENT_LEVEL_LABEL, AGENT_LEVEL_MEANING } from '@/lib/constants/catalog'
import type { AgentLevel } from '@/lib/types/catalog'
import { cn } from '@/lib/utils/cn'

/**
 * How ready the tool is for an agent, beside its name. The label alone is a
 * word nobody can rank on sight — "possible" is not obviously below "friendly"
 * — so the rule it was decided by is one hover away.
 *
 * `unverified` stays neutral rather than red: it means nobody has checked, not
 * that the tool is broken.
 */
export function AgentReadiness({ level }: { level: AgentLevel }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={cn(
            'type-label focus-ring inline-flex h-6 shrink-0 cursor-help items-center rounded-full border px-2.5 transition-colors duration-200',
            level === 'unverified'
              ? 'text-subtle hover:border-foreground/20 hover:text-foreground'
              : 'border-verified/25 bg-verified/8 text-verified'
          )}
          render={<span />}
        >
          {AGENT_LEVEL_LABEL[level]}
        </TooltipTrigger>
        <TooltipContent className="max-w-64">
          {AGENT_LEVEL_MEANING[level]}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
