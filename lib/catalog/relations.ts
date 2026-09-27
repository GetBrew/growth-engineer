import type { Catalog } from '@/lib/content/build-catalog'
import type { Relations } from '@/lib/types/catalog'

/**
 * What an entry is linked to — the one accessor for the edges the build
 * wrote (lib/content/build-relations.ts). A ref (`company:clay`,
 * `tool:clay/x`, `workflow:y`) or a tag key (`capability:x`); anything the
 * catalog doesn't hold has no relations.
 *
 * PURE MODULE: type-only imports.
 */

const NONE: Relations = { companies: [], tools: [], workflows: [], tags: [] }

export function relationsOf(catalog: Catalog, ref: string): Relations {
  return catalog.relations.get(ref) ?? NONE
}
