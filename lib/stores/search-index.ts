'use client'

import { useSyncExternalStore } from 'react'
import type { PaletteItem } from '@/lib/types/catalog'

/**
 * The ⌘K index, fetched once per visit from the prerendered `/search.json`.
 * `preloadSearchIndex` starts the fetch early (hovering the search button,
 * idle time after load) so the palette is instant when it opens; every caller
 * shares the one request.
 */

type State =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; items: ReadonlyArray<PaletteItem> }
  | { status: 'error' }

let state: State = { status: 'idle' }
let request: Promise<void> | null = null
const listeners = new Set<() => void>()

function set(next: State) {
  state = next
  for (const listener of listeners) {
    listener()
  }
}

export function preloadSearchIndex(): Promise<void> {
  if (request && state.status !== 'error') {
    return request
  }
  set({ status: 'loading' })
  request = fetch('/search.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`search index: HTTP ${response.status}`)
      }
      return response.json() as Promise<{ items: Array<PaletteItem> }>
    })
    .then((body) => set({ status: 'ready', items: body.items }))
    .catch(() => set({ status: 'error' }))
  return request
}

const SERVER_STATE: State = { status: 'idle' }

export function useSearchIndex(): State {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange)
      return () => listeners.delete(onStoreChange)
    },
    () => state,
    () => SERVER_STATE
  )
}
