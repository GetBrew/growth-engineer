import type { NextConfig } from 'next'
import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from 'next/constants'
import { SITE } from './lib/catalog/definitions'
import { githubToken } from './lib/env'
import { fetchRepoStars } from './lib/github-stars'

const nextConfig: NextConfig = {
  /** AGENTS.md is the canonical, CI-capped agent-policy file — keep the writer off. */
  agentRules: false,

  /**
   * Cache Components: every route is prerendered. Pages read their data
   * directly, with no `<Suspense>` — nothing loads — and detail pages, which
   * await their params, say `export const instant = false`. The caching
   * contract lives in docs/architecture.md.
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
   * The catalog is read from the markdown tree at build time; at request time
   * only an unknown key on a detail route (which asks the alias map) and the
   * `/mcp` endpoint read it. Their serverless bundles need the tree beside
   * them, and the tracer cannot see a directory walk. The key is a glob with
   * `contains` matching, so `/` covers every route.
   */
  outputFileTracingIncludes: {
    '/': [
      './companies/**/*',
      './workflows/**/*',
      './tags.yml',
      // The social cards' type (lib/seo/og-font.ts).
      './assets/**/*',
    ],
  },

  /**
   * No image optimizer: every image is a small static file served from the
   * CDN as it is — logos are capped at 32 KB by `content:check`, the agent
   * marks are SVGs, and a contributor's GitHub photo is a plain <img>. Nothing
   * is resized on request, and there is no open image proxy to abuse.
   */
  images: { unoptimized: true },

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
      // part now and the author lives in the file. Old links keep working —
      // but never a workflow's own social card, `/workflows/<name>/opengraph-image-…`.
      {
        source: '/workflows/:owner/:name((?!opengraph-image)[^/]+)',
        destination: '/workflows/:name',
        permanent: true,
      },
      // The relationship map is gone: relations live on each detail page and
      // in MCP `get`.
      { source: '/map', destination: '/', permanent: true },
      { source: '/map/:path*', destination: '/', permanent: true },
      // The guides moved from /contribute to /docs, under readable names.
      { source: '/contribute', destination: '/docs', permanent: true },
      {
        source: '/contribute/workflow',
        destination: '/docs/add-a-workflow',
        permanent: true,
      },
      {
        source: '/contribute/tool',
        destination: '/docs/add-a-tool',
        permanent: true,
      },
      {
        source: '/contribute/company',
        destination: '/docs/add-your-company',
        permanent: true,
      },
      { source: '/contribute/:path*', destination: '/docs', permanent: true },
      // The capability for analytics reads was renamed when event writes got their own.
      {
        source: '/tags/capability/track-product-usage.md',
        destination: '/tags/capability/analyze-product-usage.md',
        permanent: true,
      },
      // A growth hack IS a workflow; the concept went, the URL keeps its promise.
      { source: '/hacks', destination: '/workflows', permanent: true },
      { source: '/hacks/:path*', destination: '/workflows', permanent: true },
      // Submissions are pull requests: the form and the sign-in are gone.
      {
        source: '/submit',
        destination: `${SITE.repository}/blob/main/CONTRIBUTING.md`,
        permanent: true,
      },
      {
        source: '/submit-a-workflow',
        destination: `${SITE.repository}/blob/main/CONTRIBUTING.md`,
        permanent: true,
      },
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

/**
 * The header's GitHub star count, asked for once per build (and once per dev
 * server) and inlined as `process.env.GITHUB_STARS`, so every render of a
 * page prints the same number (lib/github-stars.ts). Build workers load this
 * file again; they inherit the first answer through the environment instead
 * of asking GitHub again. `next start` inlines nothing, so it asks for nothing.
 */
async function githubStars(phase: string): Promise<string> {
  if (phase !== PHASE_PRODUCTION_BUILD && phase !== PHASE_DEVELOPMENT_SERVER) {
    return ''
  }
  if (process.env.GITHUB_STARS === undefined) {
    const stars = await fetchRepoStars(SITE.repository, githubToken())
    process.env.GITHUB_STARS = stars === null ? '' : String(stars)
  }
  return process.env.GITHUB_STARS
}

export default async function config(phase: string): Promise<NextConfig> {
  return { ...nextConfig, env: { GITHUB_STARS: await githubStars(phase) } }
}
