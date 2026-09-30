'use client'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { useIsClient } from '@/lib/hooks/use-is-client'

/**
 * Vercel Web Analytics (page views) and Speed Insights (Core Web Vitals).
 * Both read the route to name the page they report, and reading it during the
 * prerender would suspend and turn every page into a partial prerender. So,
 * like the navbar, they mount once the page has hydrated. The browser buffers
 * the timings Speed Insights reads, so mounting late loses nothing. Neither
 * draws anything.
 */
export function VercelAnalytics() {
  return useIsClient() ? (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  ) : null
}
