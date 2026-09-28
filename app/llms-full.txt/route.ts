import { SITE } from '@/lib/catalog/definitions'
import { loadCorpus } from '@/lib/catalog/discovery'
import { SITE_ORIGIN } from '@/lib/env'
import { llmsPreamble } from '@/lib/seo/llms'

/**
 * `/llms-full.txt`: the same preamble as `/llms.txt`, then every rendered
 * file, each introduced by a comment naming its URL. One fetch gives an agent
 * the whole catalog — a few thousand lines today, prerendered at build.
 */
export function GET() {
  const corpus = loadCorpus()
  const parts = [
    llmsPreamble(SITE_ORIGIN, `${SITE.name} — every file`).join('\n'),
    `Files: ${corpus.length}. Each begins with a comment naming its URL, then its content as served.`,
    ...corpus.map(
      ({ file, document }) =>
        `<!-- file: ${SITE_ORIGIN}${file} -->\n\n${document.markdown.trimEnd()}`
    ),
  ]
  return new Response(`${parts.join('\n\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
    },
  })
}
