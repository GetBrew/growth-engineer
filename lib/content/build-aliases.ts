import type { Company, Tool, Workflow } from '@/lib/types/catalog'
import type { ProblemList } from './errors'

/* ─────────────────────────────────── aliases ────────────────────────────── */

/**
 * `${type}:${oldKey}` → current key. An alias may not shadow a key that
 * exists — live, or a draft waiting to publish — nor be claimed twice.
 */
export function buildAliases(
  entities: {
    companies: ReadonlyMap<string, Company>
    tools: ReadonlyMap<string, Tool>
    workflows: ReadonlyMap<string, Workflow>
  },
  drafts: { tool: ReadonlySet<string>; workflow: ReadonlySet<string> },
  problems: ProblemList
): Map<string, string> {
  const aliases = new Map<string, string>()
  const claim = (
    type: 'company' | 'tool' | 'workflow',
    live: ReadonlyMap<string, { key: string; aliases: ReadonlyArray<string> }>,
    fileOf: (key: string) => string,
    drafted: ReadonlySet<string> = new Set()
  ) => {
    for (const entity of live.values()) {
      for (const alias of entity.aliases) {
        const ref = `${type}:${alias}`
        if (live.has(alias) || drafted.has(alias)) {
          problems.add(
            fileOf(entity.key),
            `aliases: "${alias}" is an existing ${type} key, drafts included`
          )
        } else if (aliases.has(ref)) {
          problems.add(
            fileOf(entity.key),
            `aliases: "${alias}" is already an alias of ${aliases.get(ref)}`
          )
        } else {
          aliases.set(ref, entity.key)
        }
      }
    }
  }
  claim('company', entities.companies, (key) => `companies/${key}/company.md`)
  claim(
    'tool',
    entities.tools,
    (key) => {
      const [handle, name] = key.split('/')
      return `companies/${handle}/tools/${name}.md`
    },
    drafts.tool
  )
  claim(
    'workflow',
    entities.workflows,
    (key) => `workflows/${key}.md`,
    drafts.workflow
  )
  return aliases
}
