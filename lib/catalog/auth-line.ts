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

/** The same fact in plain English, for the tooltip. */
export function authMeaning(auth: Auth): string {
  const approval = auth.selfServe
    ? 'You can set this up yourself, right now.'
    : 'You have to request access and wait for approval first.'

  if (auth.method === 'none') {
    return 'Nothing to sign in with — this is open to anyone.'
  }
  if (auth.method === 'oauth') {
    return `Sign in with your account, the way a "Sign in with…" button works. Nothing to copy or paste. ${approval}`
  }
  const where = auth.envVar
    ? `save it on your machine as ${auth.envVar}`
    : 'save it on your machine'
  return `You need a secret key: get one from the company, then ${where}. ${approval}`
}
