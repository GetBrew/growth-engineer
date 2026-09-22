import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Page } from '@/components/catalog/primitives'
import { WorkflowSubmissionForm } from '@/components/submit/workflow-submission-form'

export const metadata: Metadata = { title: 'Submit a workflow or tool' }

/**
 * Public. The form opens an email to the maintainers with the details filled
 * in; nothing is stored here. Publishing itself happens by pull request.
 */
export default function SubmitPage() {
  return (
    <Suspense fallback={null}>
      <SubmitContent />
    </Suspense>
  )
}

function SubmitContent() {
  return (
    <Page className="grid min-h-[calc(100svh-var(--header-height))] place-items-center py-20 sm:py-24">
      <WorkflowSubmissionForm />
    </Page>
  )
}
