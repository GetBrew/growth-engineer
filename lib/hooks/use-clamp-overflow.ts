'use client'

import { type RefObject, useEffect, useRef, useState } from 'react'

/**
 * Does the clamped element have more text than it shows? A line clamp is a
 * width question, not a character count, so the answer is measured after
 * layout and re-measured on resize.
 *
 * `clamped` turns measuring off once the text is expanded: the clamp is gone,
 * nothing can overflow, and the last collapsed answer is the one to keep —
 * otherwise the toggle would remove itself on the way open.
 */
export function useClampOverflow<T extends HTMLElement>(
  clamped: boolean
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!(node && clamped)) {
      return
    }
    const measure = () =>
      setOverflows(node.scrollHeight > node.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [clamped])

  return [ref, overflows]
}
