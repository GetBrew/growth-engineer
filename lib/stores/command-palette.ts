'use client'

import { useSyncExternalStore } from 'react'

let isOpen = false
const listeners = new Set<() => void>()

export function setCommandPaletteOpen(open: boolean) {
  if (isOpen === open) {
    return
  }

  isOpen = open
  for (const listener of listeners) {
    listener()
  }
}

export function openCommandPalette() {
  setCommandPaletteOpen(true)
}

export function toggleCommandPalette() {
  setCommandPaletteOpen(!isOpen)
}

export function useCommandPaletteOpen() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange)
      return () => listeners.delete(onStoreChange)
    },
    () => isOpen,
    () => false
  )
}
