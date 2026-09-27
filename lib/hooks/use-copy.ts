'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Copy text to the clipboard and remember, for a moment, that it worked.
 * `copied` only turns true when the clipboard actually took the text, so a
 * "Copied" tick never claims a copy that the browser refused.
 */
export function useCopy(resetAfterMs = 1800) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      const didCopy = await navigator.clipboard
        .writeText(text)
        .then(() => true)
        .catch(() => false)
      if (didCopy) {
        setCopied(true)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), resetAfterMs)
      }
      return didCopy
    },
    [resetAfterMs]
  )

  return { copied, copy }
}
