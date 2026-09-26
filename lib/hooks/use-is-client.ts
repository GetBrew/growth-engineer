'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => undefined

/**
 * False while the page is prerendered and while it hydrates; true on every
 * render after that. A component that must read something only the browser
 * knows (the URL's query) renders its static version until this flips, so
 * the prerender never touches the request and the route stays fully static.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
