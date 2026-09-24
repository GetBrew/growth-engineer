'use client'

import { Button } from '@/components/ui/button'

export default function SiteError({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="type-page-title">This page could not be rendered</h1>
      <p className="type-body">
        The files themselves have not changed. In development, the terminal
        lists what went wrong; otherwise try again in a moment.
      </p>
      <Button onClick={reset} size="pill" variant="outline">
        Try again
      </Button>
    </div>
  )
}
