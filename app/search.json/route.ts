import { loadPaletteItems } from '@/lib/catalog/loaders'

/**
 * `/search.json` — the ⌘K index: every company, tool and workflow as one
 * flat list, prerendered at build like `/llms.txt`. The palette fetches it
 * the first time it is needed instead of every page inlining it, so a page's
 * HTML does not grow with the catalog.
 */
export async function GET() {
  return Response.json(
    { items: await loadPaletteItems() },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    }
  )
}
