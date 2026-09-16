import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Page } from '@/components/catalog/primitives'
import { WorkflowRowsSkeleton } from '@/components/catalog/skeletons'
import {
  WorkflowsIndex,
  type WorkflowsSearchParams,
} from '@/components/catalog/workflows-index'

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
      <Suspense fallback={<WorkflowRowsSkeleton />}>
        <WorkflowsIndex
          base="/hacks"
          fixedFormat="hack"
          searchParams={searchParams}
        />
      </Suspense>
    </Page>
  )
}
