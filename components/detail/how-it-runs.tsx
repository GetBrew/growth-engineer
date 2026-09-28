import Link from 'next/link'
import { accessTypeLabels } from '@/components/common/badges'
import { EntityLogo } from '@/components/common/entity-logo'
import { PANEL_HEADING } from '@/components/detail/styles'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ACCESS_LABEL, ACCESS_ORDER } from '@/lib/constants/catalog'
import type { AccessType, WorkflowStep as Step } from '@/lib/types/catalog'
import { cn } from '@/lib/utils/cn'

type StepTool = {
  key: string
  name: string
  companyName: string
  logoUrl?: string
  access: ReadonlyArray<AccessType>
}

export function HowItRuns({
  steps,
  tools,
}: {
  steps: ReadonlyArray<Step>
  tools: ReadonlyArray<StepTool>
}) {
  const toolByKey = new Map(tools.map((tool) => [tool.key, tool]))

  return (
    <section className="flex flex-col gap-(--space-xs)">
      <h2 className={PANEL_HEADING}>How it runs</h2>
      <ol className="rounded-2xl border bg-background p-5">
        {steps.map((step, index) => {
          const tool =
            step.toolKey === undefined ? undefined : toolByKey.get(step.toolKey)
          return (
            // `#step-N` is the anchor each HowToStep in the page's
            // structured data points at.
            <li
              className="relative grid scroll-mt-[calc(var(--header-height)+2rem)] grid-cols-[28px_minmax(0,1fr)] gap-3 pb-5 before:absolute before:top-7 before:bottom-0 before:left-3.25 before:w-px before:bg-border last:pb-0 last:before:hidden"
              id={`step-${index + 1}`}
              key={step.key}
            >
              <span className="type-meta relative z-10 grid size-7 place-items-center rounded-full border bg-background text-soft tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 pt-0.5">
                <h3 className="type-subsection">{step.title}</h3>
                {tool ? (
                  // One quiet line per step: who makes the tool and what it
                  // is, then its first way in on the right edge with a small
                  // count for the rest, so the name keeps the room.
                  <Link
                    className="focus-ring group -mx-1.5 mt-1.5 flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-hover"
                    href={`/tools/${tool.key}`}
                  >
                    <EntityLogo
                      className="shrink-0"
                      logoUrl={tool.logoUrl}
                      name={tool.companyName}
                      size={18}
                    />
                    <span className="type-label min-w-0 truncate text-soft transition-colors group-hover:text-foreground">
                      {tool.name}
                      <span className="text-faint"> · {tool.companyName}</span>
                    </span>
                    <WaysIn access={tool.access} />
                  </Link>
                ) : (
                  <p className="type-label mt-1.5 text-soft">
                    Your agent does this step itself.
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/**
 * "MCP", or "MCP +2": the first way in, then a count badge for the rest.
 * Hovering it opens the full list — every way in, the ones this tool has
 * ticked and bright, the ones it lacks faded — so nothing hides behind "+2".
 */
function WaysIn({ access }: { access: ReadonlyArray<AccessType> }) {
  const [first, ...rest] = accessTypeLabels(access)
  if (!first) {
    return null
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={<span className="ml-auto flex shrink-0 items-center gap-1" />}
        >
          <span className="type-meta font-mono text-faint">{first}</span>
          {/* The badge's slot is kept even when empty, so "MCP" sits in
              the same column on every step. */}
          <span
            aria-hidden={rest.length === 0 ? true : undefined}
            className={cn(
              'grid h-4 min-w-4 place-items-center rounded-full border bg-background px-1 font-medium text-[9px]/none text-soft tabular-nums',
              rest.length === 0 && 'invisible'
            )}
          >
            +{rest.length}
          </span>
          {rest.length > 0 ? (
            <span className="sr-only">, {rest.join(', ')}</span>
          ) : null}
        </TooltipTrigger>
        <TooltipContent className="flex-col items-start gap-1.5 py-2">
          <span className="text-background/60">Available over</span>
          <span className="flex items-center gap-2.5 font-mono">
            {ACCESS_ORDER.map((type) => {
              const has = access.includes(type)
              return (
                <span
                  className={cn(
                    'flex items-center gap-1',
                    !has && 'text-background/35 line-through'
                  )}
                  key={type}
                >
                  {has ? <span aria-hidden="true">✓</span> : null}
                  {ACCESS_LABEL[type]}
                </span>
              )
            })}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
