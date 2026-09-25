import Link from 'next/link'
import { accessTypeLabels } from '@/components/common/badges'
import { EntityLogo } from '@/components/common/entity-logo'
import { PANEL_HEADING } from '@/components/detail/styles'
import { Badge } from '@/components/ui/badge'
import { ACCESS_LABEL } from '@/lib/constants/catalog'
import type { AccessType, WorkflowStep as Step } from '@/lib/types/catalog'

type StepTool = {
  key: string
  name: string
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
                  <div className="mt-2 flex min-w-0 items-center gap-1.5">
                    <Link
                      className="focus-ring type-label inline-flex min-w-0 items-center gap-1.5 rounded-full border bg-background py-1 pr-2.5 pl-1 text-soft transition-colors hover:border-foreground/20 hover:text-foreground"
                      href={`/tools/${tool.key}`}
                    >
                      <EntityLogo
                        className="shrink-0 rounded-full"
                        logoUrl={tool.logoUrl}
                        name={tool.name}
                        size={16}
                      />
                      <span className="truncate">{tool.name}</span>
                    </Link>
                    {accessTypeLabels(tool.access).map((label) => (
                      <Badge
                        className="h-auto shrink-0 bg-background px-2 py-0.5"
                        key={label}
                      >
                        {label}
                      </Badge>
                    ))}
                    {step.via ? (
                      <span className="eyebrow shrink-0">
                        via {ACCESS_LABEL[step.via]}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
