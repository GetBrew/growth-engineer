'use client'

import dynamic from 'next/dynamic'

/**
 * The orb, off the critical path: `ssr: false` because it is a canvas, and a
 * dynamic import so the vendored animation is its own chunk, loaded only on
 * the page that shows it. The placeholder holds the box so nothing shifts.
 */
export const ThinkingOrb = dynamic(
  () => import('./thinking-orb').then((module) => module.ThinkingOrbCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden="true"
        className="size-16 rounded-full bg-black/[0.04]"
      />
    ),
  }
)
