/**
 * The one remote host company logos come from. Lives in its own file with NO
 * imports because next.config.ts reads it: the config's import graph is
 * loaded by Node before any alias exists, so a module that reaches `@/lib/env`
 * (or anything with a `@/` import) breaks `next typegen` and `next build`.
 */
export const CONTEXT_LOGO_HOST = 'logos.context.dev'
