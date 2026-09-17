import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Doc } from '@/convex/_generated/dataModel'
import { AccessBadges, AgentLevelBadge, FormatBadge } from './badges'
import { EntityLogo } from './entity-logo'

/**
 * The three list items. Each is a Server Component: no state, no handlers —
 * the whole row is a link (`after:absolute after:inset-0`), which is also what
 * keeps the hit target honest for keyboard users.
 */

export type ToolCardData = {
  tool: Doc<'tools'>
  company: { key: string; name: string; logoUrl?: string }
}

export function ToolCard({ tool, company }: ToolCardData) {
  return (
    <article className="group relative flex gap-4 rounded-2xl border border-border p-4 transition-colors hover:border-foreground/20">
      <EntityLogo logoUrl={company.logoUrl} name={company.name} size={44} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-semibold text-[15px] tracking-[-0.01em]">
            <Link
              className="after:absolute after:inset-0"
              href={`/tools/${tool.key}`}
            >
              {tool.name}
            </Link>
          </h3>
          <p className="text-foreground/55 text-xs">by {company.name}</p>
        </div>
        <p className="line-clamp-2 text-foreground/70 text-sm leading-5">
          {tool.summary}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          <AgentLevelBadge
            level={tool.agent.level}
            reason={tool.agent.reason}
          />
          <AccessBadges access={tool.access} />
        </div>
      </div>
    </article>
  )
}

export type WorkflowRowData = {
  workflow: Doc<'workflows'>
  tools: Array<{
    key: string
    name: string
    companyKey: string
    logoUrl?: string
  }>
}

export function WorkflowRow({ workflow, tools }: WorkflowRowData) {
  return (
    <article className="group relative flex min-h-[120px] gap-5 border-border border-b py-5 sm:gap-6 sm:py-6">
      <div
        aria-hidden="true"
        className="hidden shrink-0 items-start -space-x-3 pt-1 sm:flex"
      >
        {tools.slice(0, 3).map((tool) => (
          <EntityLogo
            className="rounded-full ring-2 ring-white"
            key={tool.key}
            logoUrl={tool.logoUrl}
            name={tool.name}
            size={44}
          />
        ))}
      </div>

      <div className="min-w-0 flex-1 pr-10 sm:pr-8">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-base tracking-[-0.02em] sm:text-lg">
            <Link
              className="after:absolute after:inset-0"
              href={`/workflows/${workflow.key}`}
            >
              {workflow.title}
            </Link>
          </h3>
          <FormatBadge format={workflow.format} />
        </div>
        {workflow.summary ? (
          <p className="mt-2 line-clamp-2 max-w-3xl text-foreground/70 text-sm leading-5">
            {workflow.summary}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-foreground/55 text-xs">
          <span>{tools.map((tool) => tool.name).join(' + ')}</span>
          <span className="rounded-full border border-border px-2 py-0.5">
            {workflow.toolCount} {workflow.toolCount === 1 ? 'tool' : 'tools'}
          </span>
        </div>
      </div>

      <ArrowRight
        aria-hidden="true"
        className="absolute top-6 right-0 size-5 text-foreground/55 transition-all duration-300 group-hover:translate-x-1 group-hover:text-foreground sm:static sm:ml-auto sm:self-center"
      />
    </article>
  )
}

export function CompanyRow({
  company,
  access = [],
}: {
  company: Doc<'companies'>
  /** How agents reach this company's tools: MCP, CLI, API. Real, not decorative. */
  access?: ReadonlyArray<string>
}) {
  return (
    <Link
      className="group/row focus-ring -mx-3 flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-black/[0.04]"
      href={`/companies/${company.key}`}
    >
      <EntityLogo
        className="shadow-[0_4px_14px_rgba(23,23,23,0.06)] transition-shadow duration-300 group-hover/row:shadow-[0_7px_20px_rgba(23,23,23,0.10)]"
        domain={company.domain}
        logoUrl={company.logo?.url}
        name={company.name}
        size={44}
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="truncate font-medium text-[15px] tracking-[-0.01em]">
            {company.name}
          </span>
          {access.map((label) => (
            <span
              className="rounded-full border border-border bg-white px-2 py-0.5 font-medium text-[10px] text-foreground/55"
              key={label}
            >
              {label}
            </span>
          ))}
        </span>
        {/* The description is the fact; the tagline is ours. Prefer the fact. */}
        <span className="mt-0.5 line-clamp-2 text-foreground/62 text-sm sm:line-clamp-1">
          {company.description ?? company.tagline}
        </span>
      </span>
      <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border bg-white text-foreground/70 transition-colors duration-300 group-hover/row:border-foreground/20 group-hover/row:text-foreground">
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </span>
    </Link>
  )
}
