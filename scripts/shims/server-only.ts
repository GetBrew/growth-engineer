/**
 * Inert stand-in for the `server-only` marker package.
 *
 * The real package throws when it is pulled into a client bundle — that guard
 * is what keeps a secret-reading module out of the browser, and it stays
 * active for `next build`. tsx CLIs and the Vitest node environment do not set
 * the `react-server` export condition, so the bare specifier would throw there
 * instead. `vitest.config.ts` aliases it here.
 */
export {}
