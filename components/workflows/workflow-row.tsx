import { ArrowRight02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { FunctionReturnType } from 'convex/server'
import Link from 'next/link'
import { accessTypeLabels } from '@/components/catalog/badges'
import { Badge } from '@/components/ui/badge'
import type { api } from '@/convex/_generated/api'
import { CompanyAvatars } from './company-avatars'

type WorkflowRows = FunctionReturnType<typeof api.workflows.list>

export type WorkflowRowData = WorkflowRows[number]

export function WorkflowRow({ workflow, tools }: WorkflowRowData) {
  const companies = [
    ...new Map(
      tools.map((tool) => [
        tool.companyKey,
        {
          key: tool.companyKey,
          name: tool.companyName,
          logoUrl: tool.logoUrl,
        },
      ])
    ).values(),
  ]

  const shown = companies.length > 3 ? companies.slice(0, 2) : companies
  const hidden = companies.length - shown.length
  const access = accessTypeLabels(tools.flatMap((tool) => tool.access))
  return (
    <article className="group relative flex gap-5 border-b py-5 sm:gap-6 sm:py-6">
      <div className="hidden w-27 shrink-0 sm:block">
        <CompanyAvatars
          companies={shown}
          links={false}
          more={hidden > 0 ? `+${hidden}` : undefined}
        />
      </div>

      <div className="min-w-0 flex-1 pr-10 sm:pr-8">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="type-item">
            <Link
              className="after:absolute after:inset-0"
              href={`/workflows/${workflow.key}`}
            >
              {workflow.title}
            </Link>
          </h3>
          <Badge>
            {workflow.toolCount} {workflow.toolCount === 1 ? 'tool' : 'tools'}
          </Badge>
          {access.map((label) => (
            <Badge key={label}>{label}</Badge>
          ))}
        </div>
        {workflow.summary ? (
          <p className="type-body mt-2 line-clamp-1 max-w-3xl">
            {workflow.summary}
          </p>
        ) : null}
      </div>

      <HugeiconsIcon
        icon={ArrowRight02Icon}
        aria-hidden="true"
        className="absolute top-6 right-0 size-5 text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-foreground sm:static sm:ml-auto sm:self-center"
      />
    </article>
  )
}
