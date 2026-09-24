import type { Company, Tool, Workflow } from '@/lib/types/catalog'
import type { ProblemList } from './errors'

/* ─────────────────────────────────── aliases ────────────────────────────── */

/** `${type}:${oldKey}` → current key; an alias may not shadow a live key. */
export function buildAliases(
  entities: {
    companies: ReadonlyMap<string, Company>
    tools: ReadonlyMap<string, Tool>
    workflows: ReadonlyMap<string, Workflow>
  },
  problems: ProblemList
): Map<string, string> {
  const aliases = new Map<string, string>()
  const claim = (
    type: 'company' | 'tool' | 'workflow',
    live: ReadonlyMap<string, { key: string; aliases: ReadonlyArray<string> }>,
    fileOf: (key: string) => string
  ) => {
    for (const entity of live.values()) {
      for (const alias of entity.aliases) {
        const ref = `${type}:${alias}`
        if (live.has(alias)) {
          problems.add(
            fileOf(entity.key),
            `aliases: "${alias}" is a live ${type} key`
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
  claim('tool', entities.tools, (key) => {
    const [handle, slug] = key.split('/')
    return `companies/${handle}/tools/${slug}.md`
  })
  claim('workflow', entities.workflows, (key) => `workflows/${key}.md`)
  return aliases
}
