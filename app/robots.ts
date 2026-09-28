import type { MetadataRoute } from 'next'
import { SITE_ORIGIN } from '@/lib/env'

/**
 * Everything is public and meant to be read by machines, so every crawler is
 * allowed everywhere a page or a file lives. The AI crawlers are named on
 * purpose: a blanket `*` already covers them, but an explicit allow is how an
 * operator reads the intent at a glance and how the answer engines' own docs
 * ask to be told. Each vendor's training crawler, search indexer and
 * user-initiated fetcher are separate tokens, so each is named.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'cohere-ai',
  'meta-externalagent',
  'Meta-ExternalFetcher',
  'Meta-WebIndexer',
  'Amazonbot',
  'Amzn-SearchBot',
  'Amzn-User',
  'MistralAI-User',
  'MistralAI-Index',
  'DuckAssistBot',
  'YouBot',
]

/**
 * `/api/` is kept out: it holds no page, only the copy counter's POST and the
 * internal target `.md` files are rewritten to, which would be a second copy
 * of every file. A crawler obeys only the most specific group that names it,
 * so every group repeats the same rules.
 */
const RULES = { allow: '/', disallow: '/api/' }

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', ...RULES },
      { userAgent: AI_CRAWLERS, ...RULES },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  }
}
