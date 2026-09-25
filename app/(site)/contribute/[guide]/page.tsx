import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { GuideSteps } from '@/components/contribute/guide-steps'
import { GuideVideo } from '@/components/contribute/guide-video'
import { DetailHeader } from '@/components/detail/header'
import { OpenInAgentMenu } from '@/components/detail/open-in-agent-menu'
import { ShareButton } from '@/components/detail/share-button'
import { PANEL_HEADING } from '@/components/detail/styles'
import { ViewSourceButton } from '@/components/detail/view-source-button'
import { BackLink } from '@/components/layout/back-link'
import { Page } from '@/components/layout/page'
import { Bar } from '@/components/skeletons/parts'
import { GUIDE_STEPS } from '@/lib/constants/guide-steps'
import {
  findGuide,
  GUIDES,
  guideDocUrl,
  guideMarkdown,
  nextGuide,
} from '@/lib/constants/guides'

type Params = Promise<{ guide: string }>

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ guide: guide.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { guide } = await params
  const found = findGuide(guide)
  return found ? { title: found.title, description: found.summary } : {}
}

/**
 * Built on the same shell as every other detail page: the page container at
 * its usual width, a back link, `DetailHeader`, then the two-column grid with
 * a sticky aside. The default export is SYNCHRONOUS and the awaited params
 * sit in a Suspense child, because awaiting URL data in the page itself
 * blocks the route from prerendering.
 */
export default function GuidePage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-(--space-record)">
      <BackLink href="/contribute" label="Learn" />
      <Suspense fallback={<GuideSkeleton />}>
        <GuideDetail params={params} />
      </Suspense>
    </Page>
  )
}

async function GuideDetail({ params }: { params: Params }) {
  const { guide } = await params
  const found = findGuide(guide)

  if (!found) {
    notFound()
  }

  const markdown = guideMarkdown(found)
  const steps = GUIDE_STEPS[found.id] ?? []
  const next = nextGuide(found.id)

  return (
    <div className="flex flex-col gap-(--space-block)">
      <DetailHeader
        actions={
          <>
            <ShareButton text={found.summary} title={found.title} />
            <ViewSourceButton href={guideDocUrl(found)} />
            {/* A guide has no file in the catalog to point at, so the download
                carries the placeholder body itself. Swap this for the guide's
                `.md` URL once guides have one. */}
            <OpenInAgentMenu
              filePath={`data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`}
              markdown={markdown}
              title={found.title}
            />
          </>
        }
        byline={<p className="eyebrow">Video · {found.length} walkthrough</p>}
        description={found.summary}
        title={found.title}
      />

      <div className="grid gap-(--space-block) lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section className="flex min-w-0 flex-col gap-(--space-block)">
          <GuideVideo loomId={found.loomId} title={found.title} />

          <div className="flex max-w-3xl flex-col gap-(--space-sm)">
            <p className="type-body">{found.intro}</p>
            <p className="type-body rounded-2xl border border-dashed bg-surface px-4 py-3">
              <b className="type-emphasis text-foreground">Note. </b>
              {found.note}
            </p>
          </div>

          <GuideSteps steps={steps} />
        </section>

        <aside className="flex flex-col gap-(--space-md) lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
          <section className="flex flex-col gap-(--space-xs)">
            <h2 className={PANEL_HEADING}>In this guide</h2>
            <ol className="flex flex-col rounded-2xl border bg-background p-2">
              {steps.map((step, index) => (
                <li key={step.key}>
                  <a
                    className="focus-ring type-control flex items-baseline gap-3 rounded-xl px-3 py-2 text-soft transition-colors hover:bg-hover hover:text-foreground"
                    href={`#${step.key}`}
                  >
                    <span className="w-4 shrink-0 text-faint tabular-nums">
                      {index + 1}
                    </span>
                    <span className="min-w-0">{step.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </section>

          {next ? (
            <Link
              className="focus-ring flex items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 transition-colors hover:bg-hover"
              href={`/contribute/${next.id}`}
            >
              <span className="flex min-w-0 flex-col">
                <span className="type-label text-faint">Next video</span>
                <span className="type-item truncate">{next.title}</span>
              </span>
              <span className="type-control shrink-0 text-soft">→</span>
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

/** Dimensionally stable: the eyebrow, title and lead, at their real sizes. */
function GuideSkeleton() {
  return (
    <div className="flex flex-col gap-(--space-3xs)">
      <div className="flex h-4 items-center">
        <Bar className="h-2.5 w-28" />
      </div>
      <div className="flex h-[34.5px] items-center">
        <Bar className="h-7 w-56" />
      </div>
      <div className="flex h-[25.5px] items-center">
        <Bar className="w-80" />
      </div>
    </div>
  )
}
