import type { MetadataRoute } from 'next'
import { SITE_ORIGIN } from '@/lib/env'

/**
 * Everything is public and meant to be read by machines, so every crawler is
 * allowed everywhere. The AI crawlers are named on purpose: a blanket `*`
 * already covers them, but an explicit allow is how an operator reads the
 * intent at a glance and how the answer engines' own docs ask to be told.
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
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'cohere-ai',
  'meta-externalagent',
  'Amazonbot',
  'DuckAssistBot',
  'YouBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_CRAWLERS, allow: '/' },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN,
  }
}
