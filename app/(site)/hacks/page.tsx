import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Page } from '@/components/catalog/primitives'
import { WorkflowsSkeleton } from '@/components/skeletons/workflows-skeleton'
import {
  WorkflowsIndex,
  type WorkflowsSearchParams,
} from '@/components/workflows/workflows-index'

export const metadata: Metadata = {
  title: 'Growth hacks',
  description:
    'One-tool workflows: a specific way to use one tool for a result.',
}

export default function HacksPage({
  searchParams,
}: {
  searchParams: WorkflowsSearchParams
}) {
  return (
    <Page>
      <Suspense fallback={<WorkflowsSkeleton />}>
        <WorkflowsIndex
          base="/hacks"
          fixedFormat="hack"
          searchParams={searchParams}
        />
      </Suspense>
    </Page>
  )
}
