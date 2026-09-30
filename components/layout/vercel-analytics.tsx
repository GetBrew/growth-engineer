'use client'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { useIsClient } from '@/lib/hooks/use-is-client'

export function VercelAnalytics() {
  return useIsClient() ? (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  ) : null
}
