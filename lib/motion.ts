/**
 * Expo-out: fast off the mark, long soft settle — the site's UI easing.
 * Mirrors `--ease-expo-out` in app/globals.css; change both together.
 */
export const EXPO_OUT = [0.16, 1, 0.3, 1] as const

/**
 * Pop-in: a panel arriving from its own edge — a touch softer than
 * `EXPO_OUT`, so a menu settles rather than snaps.
 */
export const POP_IN = [0.23, 1, 0.32, 1] as const

/** Leaving: the mirror of POP_IN, quick and out of the way. */
export const POP_OUT = [0.4, 0, 1, 1] as const
