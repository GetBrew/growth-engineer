import { clientEnv } from '@/lib/env'
import { CONTEXT_LOGO_HOST } from '@/lib/logos-host'

/**
 * Company logos. A seeded company carries a site-relative `logo.url`
 * (`/logos/clay.png`); the logo job later replaces it with a context.dev URL
 * built here. One builder, one client id, instead of the URL pasted around.
 */

export function contextLogoUrl(domain: string): string | null {
  const clientId = clientEnv.NEXT_PUBLIC_CONTEXT_LOGO_CLIENT_ID
  if (!clientId) {
    return null
  }
  const url = new URL(`https://${CONTEXT_LOGO_HOST}/`)
  url.searchParams.set('publicClientId', clientId)
  url.searchParams.set('domain', domain)
  return url.toString()
}

/** Remote logos are served as-is; Next's optimizer would only re-encode them. */
export function isRemoteLogo(src: string): boolean {
  return src.startsWith('https://')
}
