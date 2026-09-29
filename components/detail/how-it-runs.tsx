import { AiMagicIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { CodeText } from '@/components/common/code-text'
import { EntityLogo } from '@/components/common/entity-logo'
import {
  BRIEF_ITEM,
  BRIEF_LIST,
  BRIEF_MARKER,
  BRIEF_PRIMARY,
  BRIEF_SECONDARY,
  PANEL_HEADING,
} from '@/components/detail/styles'
import type { WorkflowStep as Step } from '@/lib/types/catalog'
import { cn } from '@/lib/utils/cn'

type StepTool = {
  key: string
  name: string
  companyName: string
  logoUrl?: string
}

/** Who does a step: a 16px mark and a name, on the title's 24px line. */
const WHO = 'type-helper inline-flex h-6 items-center gap-1.5 text-soft'

/**
 * How a workflow runs, as a plain numbered list: each step's title, who does
 * it (a company's tool, linked to its page, or the agent itself), and what
 * happens, in the file's own words. How to connect each tool is the file's
 * Set up and the tool's page, so it is not repeated here.
 */
export function HowItRuns({
  steps,
  tools,
}: {
  steps: ReadonlyArray<Step>
  tools: ReadonlyArray<StepTool>
}) {
  const toolByKey = new Map(tools.map((tool) => [tool.key, tool]))

  return (
    <section className="flex flex-col gap-3">
      <h2 className={PANEL_HEADING}>How it works</h2>
      <ol className={BRIEF_LIST}>
        {steps.map((step, index) => {
          const tool =
            step.toolKey === undefined ? undefined : toolByKey.get(step.toolKey)
          return (
            // `#step-N` is the anchor each HowToStep in the page's
            // structured data points at.
            <li
              className={cn(
                BRIEF_ITEM,
                'scroll-mt-[calc(var(--header-height)+2rem)]'
              )}
              id={`step-${index + 1}`}
              key={step.key}
            >
              <span className={BRIEF_MARKER}>{index + 1}</span>
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-x-2">
                  <h3 className={cn(BRIEF_PRIMARY, 'font-medium')}>
                    {step.title}
                  </h3>
                  <span aria-hidden="true" className="text-faint">
                    ·
                  </span>
                  {tool ? (
                    <Link
                      className={cn(
                        WHO,
                        'focus-ring rounded-sm transition-colors hover:text-foreground'
                      )}
                      href={`/tools/${tool.key}`}
                      title={tool.name}
                    >
                      <EntityLogo
                        className="shrink-0"
                        logoUrl={tool.logoUrl}
                        name={tool.companyName}
                        size={16}
                      />
                      {tool.companyName}
                    </Link>
                  ) : (
                    <span className={WHO}>
                      <HugeiconsIcon
                        aria-hidden="true"
                        className="shrink-0"
                        icon={AiMagicIcon}
                        size={16}
                        strokeWidth={1.8}
                      />
                      Your agent
                    </span>
                  )}
                </div>
                <p className={BRIEF_SECONDARY}>
                  <CodeText isQuiet text={step.instruction} />
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
