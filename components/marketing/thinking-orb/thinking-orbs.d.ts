export type ThinkingOrbState =
  | 'working'
  | 'searching'
  | 'solving'
  | 'listening'
  | 'composing'
  | 'shaping'

export type ThinkingOrbOptions = {
  state?: ThinkingOrbState
  size?: number
  speed?: number
  theme?: 'auto' | 'dark' | 'light'
  paused?: boolean
}

/** Initializes every [data-thinking-orb] canvas in scope. Returns a cleanup function. */
export function thinkingOrbs(
  scope?: Document | Element,
  options?: ThinkingOrbOptions
): () => void
