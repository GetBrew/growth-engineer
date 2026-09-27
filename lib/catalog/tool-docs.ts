import type { Tool } from '@/lib/types/catalog'

/** The page that documents a tool's call, else its first way in's docs. */
export function toolDocsUrl(tool: Tool): string | undefined {
  return tool.docs ?? tool.access.find((access) => access.docsUrl)?.docsUrl
}
