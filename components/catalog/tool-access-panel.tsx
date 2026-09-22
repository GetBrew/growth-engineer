import { accessHeading, orderAccess } from '@convex/model/render_access'
import type { Doc } from '@/convex/_generated/dataModel'
import { agentLevelLabel } from './badges'

type Tool = Pick<Doc<'tools'>, 'access' | 'agent'>

/**
 * The tool page's side panel: how ready the tool is for an agent, then every
 * way in, best first — the same order the file's "Set up" section uses. Facts
 * only; nothing here is decorative.
 */
export function ToolAccessPanel({ tool }: { tool: Tool }) {
  const access = orderAccess(tool.access)
  return (
    <section className="flex flex-col gap-5">
      <h2 className="type-section">Details</h2>
      <dl className="flex flex-col gap-4 rounded-2xl border bg-surface p-5">
        <div className="flex flex-col gap-1">
          <dt className="type-label text-subtle">Agent readiness</dt>
          <dd className="type-control">
            {agentLevelLabel(tool.agent.level)}
            <span className="type-body block text-subtle">
              {tool.agent.reason}
            </span>
          </dd>
        </div>
        {access.map((entry) => (
          <div
            className="flex flex-col gap-1 border-t pt-4"
            key={`${entry.type}:${entry.operation}`}
          >
            <dt className="type-label text-subtle">{accessHeading(entry)}</dt>
            <dd className="type-body flex flex-col gap-1">
              <code className="type-meta break-all">{entry.operation}</code>
              <span>{authLine(entry)}</span>
              {entry.maintainer && !entry.official ? (
                <span>Maintained by {entry.maintainer}.</span>
              ) : null}
              {entry.docsUrl ? (
                <a
                  className="text-foreground underline-offset-4 hover:underline"
                  href={entry.docsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Docs
                </a>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function authLine(entry: Tool['access'][number]): string {
  const { auth } = entry
  const approval = auth.selfServe ? 'self-serve' : 'needs approval'
  if (auth.method === 'none') {
    return 'No auth needed.'
  }
  if (auth.method === 'oauth') {
    return `OAuth, ${approval}.`
  }
  return `API key${auth.envVar ? ` in $${auth.envVar}` : ''}, ${approval}.`
}
