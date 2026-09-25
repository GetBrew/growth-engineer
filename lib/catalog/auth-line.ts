import type { Auth } from '@/lib/types/catalog'

/**
 * How you authenticate, in one line. Two fields decide it — the method, and
 * whether you can get the credential without asking anyone — so there are
 * seven possible sentences and no free text.
 *
 * PURE MODULE: type-only imports; runs at build time and in the browser.
 */
export function authLine(auth: Auth): string {
  if (auth.method === 'none') {
    return 'No auth needed'
  }
  const approval = auth.selfServe ? 'self-serve' : 'needs approval'
  if (auth.method === 'oauth') {
    return `OAuth, ${approval}`
  }
  return `API key${auth.envVar ? ` in $${auth.envVar}` : ''}, ${approval}`
}
