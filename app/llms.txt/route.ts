import { SITE } from '@/lib/catalog/definitions'
import { loadLlmsIndex, loadLlmsTags } from '@/lib/catalog/discovery'
import { SITE_ORIGIN } from '@/lib/env'
import { llmsPreamble } from '@/lib/seo/llms'

/**
 * `/llms.txt` (llmstxt.org): what the catalog is, the words it uses, and a
 * link to every file with a one-line summary — so an agent can discover the
 * whole catalog from one fetch and pick a file without opening it. Served by
 * the route handler, prerendered at build; the proxy only reports the fetch
 * to Notra.
 */
function section(
  heading: string,
  entries: ReadonlyArray<{ title: string; file: string; summary: string }>
): Array<string> {
  return [
    `## ${heading}`,
    '',
    ...entries.map(
      (entry) =>
        `- [${entry.title}](${SITE_ORIGIN}${entry.file}): ${entry.summary}`
    ),
    '',
  ]
}

export function GET() {
  const index = loadLlmsIndex()
  const tags = loadLlmsTags()
  const lines = [
    ...llmsPreamble(SITE_ORIGIN, SITE.name),
    ...section('Workflows', index.workflow),
    ...section('Tools', index.tool),
    ...section('Companies', index.company),
    ...section('Tags', tags),
    '## Optional',
    '',
    `- [Every company, tool and workflow file in one document](${SITE_ORIGIN}/llms-full.txt): the whole catalog, for one read.`,
    `- [Sitemap](${SITE_ORIGIN}/sitemap.xml): every page.`,
    `- [Repository](${SITE.repository}): the files themselves.`,
    `- [Contributing](${SITE.repository}/blob/main/CONTRIBUTING.md): add a workflow, a company or a fix by pull request; the fields are in workflows/README.md and companies/README.md.`,
    '',
  ]
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
    },
  })
}
