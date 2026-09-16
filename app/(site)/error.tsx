'use client'

import { Button } from '@/components/ui/button'

/**
 * A failed catalog read lands here, never in a cache: nothing thrown inside a
 * `'use cache'` scope is stored, so the next request tries again.
 */
export default function SiteError({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="font-semibold text-2xl tracking-[-0.03em]">
        The catalog is unavailable
      </h1>
      <p className="text-foreground/60 text-sm leading-6">
        The backend did not answer. The files themselves have not changed; try
        again in a moment.
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}
