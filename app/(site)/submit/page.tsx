import { auth } from '@clerk/nextjs/server'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Page } from '@/components/catalog/primitives'
import { WorkflowSubmissionForm } from '@/components/submit/workflow-submission-form'

export const metadata: Metadata = { title: 'Submit a workflow or tool' }

/**
 * The only page whose protection is not enforced inside the thing it
 * protects, so it enforces it here too. `proxy.ts` gives a signed-out
 * visitor the real 307; this `auth.protect()` is what still holds if path
 * matching ever diverges from routing — the reason Clerk deprecated
 * matcher-only gating. Every `/api/*` route already authenticates itself.
 *
 */
export default function SubmitPage() {
  return (
    <Suspense fallback={null}>
      <SubmitContent />
    </Suspense>
  )
}

async function SubmitContent() {
  await auth.protect()
  return (
    <Page className="grid min-h-[calc(100svh-var(--header-height))] place-items-center py-20 sm:py-24">
      <WorkflowSubmissionForm />
    </Page>
  )
}
