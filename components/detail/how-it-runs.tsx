import { CodeText } from '@/components/common/code-text'
import { StepMarker } from '@/components/detail/step-marker'
import { BRIEF_SECONDARY, PANEL_HEADING } from '@/components/detail/styles'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { WorkflowStep as Step } from '@/lib/types/catalog'
import { cn } from '@/lib/utils/cn'

type StepTool = {
  key: string
  name: string
  companyName: string
  logoUrl?: string
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
    <section className="flex flex-col gap-3">
      <h2 className={PANEL_HEADING}>How it works</h2>
      <TooltipProvider>
        <ol className="flex flex-col">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1
            const tool =
              step.toolKey === undefined
                ? undefined
                : toolByKey.get(step.toolKey)
            const who = tool
              ? `${tool.name} by ${tool.companyName}`
              : 'Your agent'
            return (
              <li
                className="grid scroll-mt-(--sticky-top) grid-cols-(--grid-step) gap-x-3"
                id={`step-${index + 1}`}
                key={step.key}
              >
                <StepMarker
                  company={
                    tool
                      ? {
                          key: tool.key,
                          name: tool.companyName,
                          logoUrl: tool.logoUrl,
                          href: `/tools/${tool.key}`,
                        }
                      : undefined
                  }
                  isLast={isLast}
                  label={who}
                />
                <div
                  className={cn(
                    'flex min-w-0 flex-col gap-1',
                    !isLast && 'pb-6'
                  )}
                >
                  <h3 className="type-item flex min-h-7 items-center gap-2 text-foreground">
                    <span
                      aria-hidden="true"
                      className="text-faint tabular-nums"
                    >
                      {index + 1}
                    </span>
                    {step.title}
                    <span className="sr-only">, by {who}</span>
                  </h3>
                  <p className={BRIEF_SECONDARY}>
                    <CodeText isQuiet text={step.instruction} />
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </TooltipProvider>
    </section>
  )
}
