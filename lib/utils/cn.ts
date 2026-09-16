import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes so the LAST conflicting utility wins.
 *
 * Plain string concatenation does not: `"p-2" + " p-4"` leaves both in the
 * class attribute and the winner is whichever CSS rule the stylesheet emits
 * later — which is not the one the caller passed. `twMerge` resolves that by
 * utility group, which is what makes a `className` prop on a component
 * actually able to override the component's own padding.
 */
export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}
