import { LinkSquare02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { EntityLogo } from '@/components/common/entity-logo'
import { PANEL_HEADING } from '@/components/detail/styles'
import { selectWorkflowAccess } from '@/lib/catalog/render-access'
import type { Access } from '@/lib/types/catalog'

type NeedTool = {
  access: ReadonlyArray<Access>
  company: { key: string; name: string; logoUrl?: string }
}

type Need = { text: string; code?: string; keyUrl?: string }

/** What the best way in asks of a person: a sign-in, a key, nothing. */
function needOf(access: Access): Need {
  const { auth } = access
  if (auth.method === 'api_key') {
    return {
      text: 'An API key in',
      code: `$${auth.envVar}`,
      ...(auth.keyUrl ? { keyUrl: auth.keyUrl } : {}),
    }
  }
  if (auth.method === 'oauth') {
    switch (access.type) {
      case 'mcp':
        return { text: 'Sign in over MCP' }
      case 'cli':
        return { text: 'Sign in with its CLI,', code: access.binary }
      default:
        return { text: 'An OAuth access token' }
    }
  }
  return { text: 'Nothing: no sign-in or key' }
}

/**
 * What a person needs before the agent can run the workflow: per company, in
 * the order its tools are used, the sign-in or key the file's first option
 * asks for. The same choice the file makes (`selectWorkflowAccess`), so the
 * box and the file never disagree.
 */
export function YouWillNeed({
  tools,
  inputCount,
}: {
  tools: ReadonlyArray<NeedTool>
  inputCount: number
}) {
  const byCompany = new Map<
    string,
    { company: NeedTool['company']; needs: Map<string, Need> }
  >()
  for (const tool of tools) {
    const [best] = selectWorkflowAccess(tool.access)
    const entry = byCompany.get(tool.company.key) ?? {
      company: tool.company,
      needs: new Map<string, Need>(),
    }
    if (best) {
      const need = needOf(best)
      entry.needs.set(`${need.text}${need.code ?? ''}`, need)
    }
    byCompany.set(tool.company.key, entry)
  }

  return (
    <section className="flex flex-col gap-(--space-xs)">
      <h2 className={PANEL_HEADING}>You’ll need</h2>
      <ul className="flex flex-col gap-3 rounded-2xl border bg-background p-5">
        {[...byCompany.values()].map(({ company, needs }) => (
          <li className="flex min-w-0 items-start gap-3" key={company.key}>
            <EntityLogo
              className="mt-0.5 shrink-0"
              logoUrl={company.logoUrl}
              name={company.name}
              size={20}
            />
            <div className="flex min-w-0 flex-col">
              <span className="type-label text-foreground">{company.name}</span>
              {[...needs.values()].map((need) => (
                <span
                  className="type-meta flex flex-wrap items-center gap-x-1.5 text-soft"
                  key={`${need.text}${need.code ?? ''}`}
                >
                  {need.text}
                  {need.code ? (
                    <code className="font-mono">{need.code}</code>
                  ) : null}
                  {need.keyUrl ? (
                    <a
                      className="focus-ring inline-flex items-center gap-1 rounded-sm underline-offset-4 hover:text-foreground hover:underline"
                      href={need.keyUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      get one
                      <HugeiconsIcon
                        aria-hidden="true"
                        icon={LinkSquare02Icon}
                        size={11}
                        strokeWidth={1.8}
                      />
                    </a>
                  ) : null}
                </span>
              ))}
            </div>
          </li>
        ))}
        {inputCount > 0 ? (
          <li className="type-meta border-t pt-3 text-soft">
            Your agent asks you for {inputCount}{' '}
            {inputCount === 1 ? 'input' : 'inputs'} first, and before it sends,
            spends or changes anything.
          </li>
        ) : null}
      </ul>
    </section>
  )
}
