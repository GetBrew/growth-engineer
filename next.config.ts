import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * `next dev` otherwise upserts a managed block into AGENTS.md / CLAUDE.md
   * on every boot. This repo's AGENTS.md is the canonical agent-policy file
   * and is CI-capped — keep the writer off it.
   */
  agentRules: false,

  /**
   * Cache Components (formerly PPR). Every route gets a prerendered static
   * shell; request-time data is streamed into it.
   *
   * THE RULE THIS IMPOSES: any `await auth()` / `cookies()` / `headers()` /
   * `params` / `searchParams` must live inside a `<Suspense>` boundary, never
   * at the top of an async page — a top-of-page dynamic read blocks the whole
   * shell from prerendering. Canonical pattern: app/(app)/dashboard/page.tsx.
   * Never `export const dynamic = 'force-dynamic'`; reach for
   * `Cache-Control: no-store` or the Next 16 cache model instead.
   */
  cacheComponents: true,

  /**
   * Instant Navigations: prefetch one reusable App Shell per route instead of
   * a full payload per visible link. Requires `cacheComponents`. A per-link
   * `prefetch={true}` still opts a destination into URL-specific prefetch.
   */
  partialPrefetching: true,

  /**
   * Acknowledge Turbopack as the bundler. An empty object is the documented
   * way to say "yes, Turbopack" — and it is required before
   * `experimental.turbopackRustReactCompiler` will run.
   */
  turbopack: {},

  /**
   * React Compiler, compiled in Rust inside Turbopack (no Babel in the
   * pipeline). The native compiler only runs under Turbopack — a webpack
   * build with this flag throws.
   */
  reactCompiler: true,

  /** Browser warnings and errors land in the `next dev` terminal. */
  logging: {
    browserToTerminal: 'warn',
  },

  experimental: {
    turbopackRustReactCompiler: true,

    /**
     * Dev-only: do not keep the RSC fetch cache alive across Fast Refresh.
     * Measured on a large app: ~600 MB lower peak dev RSS and roughly half the
     * HMR p50. The cost is a re-fetch of `fetch()` data per refresh, which an
     * app whose reads go through the Convex client barely pays.
     */
    serverComponentsHmrCache: false,

    /**
     * Instant Insights: validate every Page/Default segment in `next dev`, so
     * a missing `<Suspense>` around `auth()` / `params` / uncached I/O shows
     * up as a blocking-route overlay instead of a slow route in production.
     * The framework default is already `'warning'`; pin it so a future default
     * change cannot silently drop coverage.
     */
    instantInsights: {
      validationLevel: 'warning',
    },
    /** Keep server stack locations readable in deployed functions. */
    serverSourceMaps: true,
  },

  /**
   * Client source maps are emitted only where something consumes them (an
   * error tracker's build step). Locally they cost build time and a few
   * hundred MB of `.next` per checkout; in the browser they leak source.
   */
  productionBrowserSourceMaps: process.env.EMIT_BROWSER_SOURCEMAPS === '1',

  /**
   * Add the exact remote hosts you serve images from to `remotePatterns` when
   * you need them. A wildcard (`hostname: '**'`) turns your deployment into an
   * open image proxy that anyone can point at anything.
   */
  images: {
    formats: ['image/avif', 'image/webp'],
    // Trim the default ladder to the widths this app actually renders: every
    // extra size is another on-demand optimization and another cache entry.
    deviceSizes: [640, 750, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 75, 90],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Defense in depth for the three headers no framework sets for you.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default nextConfig
