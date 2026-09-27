import type { Auth } from '@/lib/types/catalog'

/**
 * How you authenticate, in one line, from the one fact that decides it: the
 * method. No free text.
 *
 * PURE MODULE: type-only imports; runs at build time and in the browser.
 */
export function authLine(auth: Auth): string {
  switch (auth.method) {
    case 'none':
      return 'No auth needed'
    case 'oauth':
      return 'OAuth'
    default:
      return `API key in $${auth.envVar}`
  }
}
