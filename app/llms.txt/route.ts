import { parseRef, refToFilePath } from '@/lib/catalog/keys'
import { loadDocumentRefs } from '@/lib/catalog/loaders'
import { clientEnv } from '@/lib/env'

const TRAILING_SLASH = /\/$/

export async function GET() {
  const documents = await loadDocumentRefs()
  const origin = clientEnv.NEXT_PUBLIC_SITE_URL.replace(TRAILING_SLASH, '')
  const lines = [
    '# growth.engineer',
    '',
    '> Companies, the tools they make, and workflows that put tools to work.',
    '> Every tool and workflow is one markdown file any agent can run.',
    '',
    `Site: ${origin}`,
    'Format: each file has a flat YAML header, setup, steps and rules.',
    'Fetch any page with `Accept: text/markdown` to receive its file.',
    '',
  ]
  const groups: Record<'company' | 'tool' | 'workflow', Array<string>> = {
    tool: [],
    workflow: [],
    company: [],
  }
  for (const document of documents) {
    const ref = parseRef(document.ref)
    if (ref) {
      groups[ref.type].push(`- ${origin}${refToFilePath(ref)}`)
    }
  }
  lines.push('## Tools', '', ...groups.tool, '')
  lines.push('## Workflows', '', ...groups.workflow, '')
  lines.push('## Companies', '', ...groups.company, '')

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
    },
  })
}
