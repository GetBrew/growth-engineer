import Link from 'next/link'
import { EntityLogo } from '@/components/catalog/entity-logo'
import type { Doc } from '@/convex/_generated/dataModel'

type Step = Doc<'workflowVersions'>['steps'][number]
type StepTool = { key: string; name: string; logoUrl?: string }

const VIA_LABEL = { mcp: 'MCP', cli: 'CLI', api: 'API' } as const

export function HowItRuns({
  steps,
  tools,
}: {
  steps: ReadonlyArray<Step>
  tools: ReadonlyArray<StepTool>
}) {
  const toolByKey = new Map(tools.map((tool) => [tool.key, tool]))

  return (
    <section className="flex flex-col gap-5">
      <h2 className="type-section">How it runs</h2>
      <ol className="rounded-2xl border bg-background p-5">
        {steps.map((step, index) => {
          const tool = toolByKey.get(step.toolKey)
          return (
            <li
              className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-3 pb-5 before:absolute before:top-7 before:bottom-0 before:left-3.25 before:w-px before:bg-border last:pb-0 last:before:hidden"
              key={step.key}
            >
              <span className="type-meta relative z-10 grid size-7 place-items-center rounded-full border bg-background text-soft tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 pt-0.5">
                <h3 className="type-subsection">{step.title}</h3>
                {tool ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Link
                      className="focus-ring type-label inline-flex items-center gap-1.5 rounded-full border bg-background py-1 pr-2.5 pl-1 text-soft transition-colors hover:border-foreground/20 hover:text-foreground"
                      href={`/tools/${tool.key}`}
                    >
                      <EntityLogo
                        className="rounded-full"
                        logoUrl={tool.logoUrl}
                        name={tool.name}
                        size={16}
                      />
                      {tool.name}
                    </Link>
                    {step.via ? (
                      <span className="eyebrow">via {VIA_LABEL[step.via]}</span>
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
