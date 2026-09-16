'use client'

import { useEffect, useRef } from 'react'
import { type ThinkingOrbState, thinkingOrbs } from './thinking-orbs'

/**
 * Vendored: Thinking Orbs by Jakub Antalik (MIT), the canvas animation in the
 * home hero. Mount through `./index.tsx`, which loads it dynamically so the
 * 1,000-line animation never lands in the shared shell.
 */
export function ThinkingOrbCanvas({
  state = 'shaping',
  size = 64,
  speed = 1,
  label,
  className,
}: {
  state?: ThinkingOrbState
  size?: number
  speed?: number
  label?: string
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    return thinkingOrbs(canvas)
  }, [])

  return (
    <canvas
      aria-label={label}
      className={className}
      data-orb-paused="false"
      data-orb-size={size}
      data-orb-speed={speed}
      data-orb-state={state}
      data-orb-theme="light"
      data-thinking-orb=""
      ref={canvasRef}
      role={label ? 'img' : undefined}
    />
  )
}
