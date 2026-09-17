import { auth } from '@clerk/nextjs/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { Page, SectionHeading } from '@/components/catalog/primitives'

export const metadata: Metadata = { title: 'Submit a workflow' }

const STEPS = [
  [
    'Fill in a short form.',
    'A title phrased as the result, the inputs, the steps (pick a tool, write what to do), and the checks that mean it is done.',
  ],
  [
    'Watch the file build as you type.',
    'The preview is the exact file people will copy.',
  ],
  [
    'Save.',
    'The workflow is live right away at an unlisted link you can share.',
  ],
  [
    'An automated scan checks the steps.',
    'It looks for data sent to unknown places, hidden text, requests for credentials, and instructions that override the user.',
  ],
  [
    'A moderator approves it into search and feeds.',
    'Vendors publishing under their own handle skip this step; the scan still runs.',
  ],
] as const

/**
 * The only page whose protection is not enforced inside the thing it
 * protects, so it enforces it here too. `proxy.ts` gives a signed-out
 * visitor the real 307; this `auth.protect()` is what still holds if path
 * matching ever diverges from routing — the reason Clerk deprecated
 * matcher-only gating. Every `/api/*` route already authenticates itself.
 *
 * The publish flow ships with the submissions pipeline; until then this page
 * is the contract it will meet, so nobody builds a form that renders a
 * different file than the catalog does.
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
    <Page className="flex max-w-3xl flex-col gap-10">
      <SectionHeading
        as="h1"
        description="Publishing arrives with the submissions pipeline. This is how it will work, so the file you write is the file the catalog serves."
        eyebrow="Coming soon"
        title="Submit a workflow"
      />
      <ol className="flex flex-col gap-5">
        {STEPS.map(([title, detail], index) => (
          <li className="flex gap-4" key={title}>
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border font-semibold text-foreground/62 text-sm">
              {index + 1}
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-semibold">{title}</p>
              <p className="text-foreground/62 text-sm leading-6">{detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="rounded-2xl border border-border bg-[#fafafa] p-6 text-sm leading-6">
        <p className="font-medium">Until the form ships</p>
        <p className="mt-1 text-foreground/62">
          Read a published file first — for example{' '}
          <Link
            className="underline underline-offset-4"
            href="/workflows/brew/funding-signal-outbound"
          >
            funding-signal-outbound
          </Link>{' '}
          — then email the same sections (title, inputs, steps with the tool for
          each, done-when) to{' '}
          <a
            className="underline underline-offset-4"
            href="mailto:founders@brew.new"
          >
            founders@brew.new
          </a>
          . A person adds it and it renders through the same function as every
          other file.
        </p>
      </div>
    </Page>
  )
}
