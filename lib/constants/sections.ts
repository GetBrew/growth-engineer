import type { EntityType } from '@/lib/catalog/keys'

/**
 * The three listings the site is made of, in the order they are always shown.
 *
 * The navbar, the ⌘K palette, the home page's tabs and the footer each drew
 * their own copy of this list, so a fourth section would have meant editing
 * four files and the order could drift between them. One list, one order.
 *
 * PURE MODULE: data only. The path is `/${entity}s` by construction, but it is
 * written out rather than derived — a route is not a plural, and a rename of
 * one must not silently rename the other.
 */

export type Section = {
  entity: EntityType
  href: string
  label: string
}

export const SECTIONS: ReadonlyArray<Section> = [
  // The home page IS the workflow list.
  { entity: 'workflow', href: '/', label: 'Workflows' },
  { entity: 'tool', href: '/tools', label: 'Tools' },
  { entity: 'company', href: '/companies', label: 'Companies' },
]
