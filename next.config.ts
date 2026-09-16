import type { NextConfig } from 'next'
// Relative, alias-free: see lib/logos-host.ts for why.
import { CONTEXT_LOGO_HOST } from './lib/logos-host'

const nextConfig: NextConfig = {
  /** AGENTS.md is the canonical, CI-capped agent-policy file — keep the writer off. */
  agentRules: false,

  /**
   * Cache Components: every route gets a prerendered static shell and streams
   * request-time data into it. The rule this imposes — every request-time read
   * inside a `<Suspense>` child, never at the top of an async page — and the
   * catalog's caching contract live in docs/architecture.md.
   */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {},
  reactCompiler: true,
  logging: { browserToTerminal: 'warn' },

  experimental: {
    turbopackRustReactCompiler: true,
    serverComponentsHmrCache: false,
    instantInsights: { validationLevel: 'warning' },
    serverSourceMaps: true,
  },

  productionBrowserSourceMaps: process.env.EMIT_BROWSER_SOURCEMAPS === '1',

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 75, 90],
    // Company logos come from ONE remote host (lib/logos.ts); everything else
    // is local. A wildcard here would make the deployment an open image proxy.
    remotePatterns: [{ protocol: 'https', hostname: CONTEXT_LOGO_HOST }],
  },

  /**
   * Keys and URLs are permanent after publishing, so the site starts on the
   * canonical routes and the prototype's URLs redirect. `/workflow` and
   * `/workflow/:path*` are matched separately on purpose: a `/workflow(.*)`
   * pattern also matches `/workflows` and loops forever.
   */
  async redirects() {
    return [
      { source: '/workflow', destination: '/workflows', permanent: true },
      {
        source: '/workflow/:path*',
        destination: '/workflows',
        permanent: true,
      },
      { source: '/login', destination: '/sign-in', permanent: true },
      { source: '/submit-a-workflow', destination: '/submit', permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
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
