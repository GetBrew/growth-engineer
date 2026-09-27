import type { AccessType } from '@/lib/types/catalog'

/**
 * The DERIVED tag namespace. `has:*` is each way in a tool offers, computed
 * from its access facts at build time. These are constants, not files under
 * tags.yml, so no contributor has to remember to tag a tool with what its own
 * access already says.
 */

export type DerivedTag = {
  namespace: 'has'
  slug: AccessType
  label: string
  synonyms: ReadonlyArray<string>
}

export const DERIVED_TAGS: ReadonlyArray<DerivedTag> = [
  {
    namespace: 'has',
    slug: 'mcp',
    label: 'Has MCP',
    synonyms: ['mcp'],
  },
  {
    namespace: 'has',
    slug: 'cli',
    label: 'Has CLI',
    synonyms: ['cli'],
  },
  {
    namespace: 'has',
    slug: 'api',
    label: 'Has API',
    synonyms: ['api'],
  },
]

/** The derived tag keys one tool carries: one per way in. */
export function derivedTagKeys(tool: {
  access: ReadonlyArray<{ type: AccessType }>
}): Array<string> {
  const types = [...new Set(tool.access.map((entry) => entry.type))]
  return types.map((type) => `has:${type}`)
}
