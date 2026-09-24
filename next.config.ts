import type { NextConfig } from 'next'

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

  /**
   * The catalog is read from the markdown tree at build time; the only routes
   * that read it at request time are the ones with `searchParams` (/tools,
   * /companies, /workflows, /map). Their serverless bundles need the tree
   * beside them, and the tracer cannot see a directory walk.
   */
  outputFileTracingIncludes: {
    '/': ['./companies/**/*', './workflows/**/*', './tags/**/*'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 75, 90],
    // Every image is local. A contributor's GitHub photo is the one remote
    // source and it renders unoptimized, so no host needs allowing here — a
    // wildcard would make the deployment an open image proxy.
    remotePatterns: [],
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
      // Workflows used to live at `/workflows/<owner>/<name>`; the key is one
      // part now and the author lives in the file. Old links keep working.
      {
        source: '/workflows/:owner/:name',
        destination: '/workflows/:name',
        permanent: true,
      },
      { source: '/login', destination: '/sign-in', permanent: true },
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
