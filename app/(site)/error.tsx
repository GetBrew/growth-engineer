'use client'

import { ArrowReloadHorizontalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { NoResults } from '@/components/common/no-results'
import { Page } from '@/components/layout/page'
import { Button, buttonVariants } from '@/components/ui/button'

export default function SiteError({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <Page>
      <NoResults
        description="Nothing in the catalog has changed. This page just failed to load."
        icon={ArrowReloadHorizontalIcon}
        title="Something went wrong"
      >
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={reset} size="pill" type="button">
            <HugeiconsIcon
              aria-hidden="true"
              icon={ArrowReloadHorizontalIcon}
              size={16}
              strokeWidth={1.8}
            />
            Try again
          </Button>
          <Link
            className={buttonVariants({ variant: 'outline', size: 'pill' })}
            href="/"
          >
            Go home
          </Link>
        </div>
      </NoResults>
    </Page>
  )
}
