import Link from 'next/link'
import { accessTypeLabels } from '@/components/common/badges'
import { EntityLogo } from '@/components/common/entity-logo'
import { PANEL_HEADING } from '@/components/detail/styles'
import type { AccessType, WorkflowStep as Step } from '@/lib/types/catalog'

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
          const tool = toolByKey.get(step.toolKey)
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
                  // is, then the ways in as plain text on the right edge, so
                  // they line up down the list instead of stacking badges.
                  <Link
                    className="focus-ring group -mx-1.5 mt-1.5 flex min-w-0 items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-hover"
                    href={`/tools/${tool.key}`}
                  >
                    <EntityLogo
                      className="shrink-0"
                      logoUrl={tool.logoUrl}
                      name={tool.companyName}
                      size={16}
                    />
                    <span className="type-label min-w-0 truncate text-soft transition-colors group-hover:text-foreground">
                      {tool.name}
                      <span className="text-faint"> · {tool.companyName}</span>
                    </span>
                    <span className="type-meta ml-auto shrink-0 font-mono text-faint">
                      {accessTypeLabels(tool.access).join(' · ')}
                    </span>
                  </Link>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
