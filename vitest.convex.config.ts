import path from 'node:path'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

/**
 * Convex FUNCTION tests. Separate from the unit suite because `convex-test`
 * runs your functions in the same Web-standards runtime Convex uses — which
 * is what makes an authorization test meaningful: a query that forgets its
 * guard fails here, not in production.
 */
export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: [path.resolve(__dirname, 'tsconfig.base.json')],
    }),
  ],
  test: {
    globals: true,
    environment: 'edge-runtime',
    setupFiles: ['./tests/setup.ts'],
    include: ['convex/**/*.test.ts'],
    // convex-test holds one in-memory backend per file; one worker keeps the
    // memory profile flat and the failures readable.
    maxWorkers: 1,
    testTimeout: 30_000,
  },
})
