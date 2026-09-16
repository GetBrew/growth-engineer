/**
 * The primary navigation, in a plain module: a Server Component (the navbar)
 * and a Client Component (the active-link marker) both read it. A value
 * exported from a `'use client'` module reaches the server as a client
 * REFERENCE, not the array — `NAV_ITEMS.map is not a function` at build.
 */
export const NAV_ITEMS = [
  { href: '/workflows', label: 'Workflows' },
  { href: '/tools', label: 'Tools' },
  { href: '/companies', label: 'Companies' },
] as const
