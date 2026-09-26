import type { AccessType } from '@/lib/types/catalog'

/**
 * The catalog's closed sets, written once. A label or an order duplicated in
 * a component and again in the renderer drifts the moment one of them is
 * edited, which is how a page and the markdown file it shows end up
 * disagreeing about the same tool.
 */

/** The ways in, in setup order: best-supported first. */
export const ACCESS_ORDER: ReadonlyArray<AccessType> = ['mcp', 'cli', 'api']

/** The same order as a rank, for sorting. Derived, never written twice. */
export const ACCESS_RANK = Object.fromEntries(
  ACCESS_ORDER.map((type, index) => [type, index])
) as Record<AccessType, number>

export const ACCESS_LABEL: Record<AccessType, string> = {
  mcp: 'MCP',
  cli: 'CLI',
  api: 'API',
}
