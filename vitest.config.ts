import path from 'node:path'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const configuredMaxWorkers = Number.parseInt(
  process.env.VITEST_MAX_WORKERS ?? '',
  10
)
const localMaxWorkers =
  Number.isFinite(configuredMaxWorkers) && configuredMaxWorkers > 0
    ? configuredMaxWorkers
    : 2

/**
 * The unit suite: `tests/**` in the cheap `node` environment — no DOM, no
 * network, no Convex client, no React rendering by default. A file that needs
 * a DOM opts in with a `// @vitest-environment jsdom` docblock at the top.
 *
 * Convex FUNCTION tests are the one thing that does not live here:
 * `convex-test` needs an `import.meta.glob` beside `convex/`, so they live at
 * `convex/**\/*.test.ts` and run through `vitest.convex.config.ts`.
 */
export default defineConfig({
  plugins: [
    // Aliases come from the ONE map in tsconfig.base.json. Never restate an
    // alias here — add it to the base and every tool picks it up (guarded by
    // tests/tsconfig-paths-consistency.test.ts).
    tsconfigPaths({
      projects: [path.resolve(__dirname, 'tsconfig.base.json')],
    }),
  ],
  resolve: {
    alias: {
      // Next sets the `react-server` export condition, which resolves
      // `server-only` to an empty module in server bundles. Vitest's node
      // environment does not, so importing it would throw. The real guard
      // still fires in client bundles at build time.
      'server-only': path.resolve(__dirname, 'scripts/shims/server-only.ts'),
    },
  },
  // Vite's PostCSS pipeline cannot load the string-form Tailwind v4 plugin,
  // and no unit test asserts styling.
  css: {
    postcss: { plugins: [] },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: [
      'node_modules/**',
      // Opt-in only: suites that hit a real service.
      // `VITEST_LIVE=1 pnpm test:run tests/<file>.live.test.ts`
      ...(process.env.VITEST_LIVE === '1' ? [] : ['tests/**/*.live.test.ts']),
    ],
    // A Vitest worker owns a Vite transform graph and can hold hundreds of MB.
    // Agents commonly run suites from several git worktrees at once, so keep
    // local fan-out bounded; CI has an isolated runner and keeps the default.
    maxWorkers: process.env.CI ? undefined : localMaxWorkers,
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
})
