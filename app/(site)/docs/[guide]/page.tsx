import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CodeText } from '@/components/common/code-text'
import {
  GuideSteps,
  type ResolvedGuideStep,
} from '@/components/contribute/guide-steps'
import { GuideVideo } from '@/components/contribute/guide-video'
import { DetailHeader } from '@/components/detail/header'
import { OpenInAgentMenu } from '@/components/detail/open-in-agent-menu'
import { ShareButton } from '@/components/detail/share-button'
import { PANEL_HEADING } from '@/components/detail/styles'
import { ViewSourceButton } from '@/components/detail/view-source-button'
import { BackLink } from '@/components/layout/back-link'
import { Page } from '@/components/layout/page'
import { loadSourceExcerpt } from '@/lib/catalog/loaders'
import { GUIDE_STEPS, type GuideStep } from '@/lib/constants/guide-steps'
import {
  findGuide,
  GUIDES,
  type Guide,
  guideDocUrl,
  guideMarkdown,
  guidePath,
  nextGuide,
  previousGuide,
} from '@/lib/constants/guides'
import { pageMetadata } from '@/lib/seo/metadata'
import { cn } from '@/lib/utils/cn'

type Params = Promise<{ guide: string }>

/**
 * Every page here is prerendered from `generateStaticParams`, and reading
 * `params` outside `<Suspense>` is deliberate: nothing loads. So navigating
 * here may block rather than show a fallback; `instant = false` says so.
 */
export const instant = false

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ guide: guide.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { guide } = await params
  const found = findGuide(guide)
  return found
    ? pageMetadata({
        title: found.title,
        description: found.summary,
        path: guidePath(found),
      })
    : {}
}

/** A quoted file is read from the repository at build; a command is as written. */
async function resolveStep(step: GuideStep): Promise<ResolvedGuideStep> {
  const { sample, ...rest } = step
  if (!sample) {
    return rest
  }
  if ('file' in sample) {
    return {
      ...rest,
      sample: {
        caption: sample.file,
        code: await loadSourceExcerpt(sample.file, sample.excerpt, sample.omit),
      },
    }
  }
  return { ...rest, sample }
}

/**
 * Built on the same shell as every other detail page: the page container at
 * its usual width, a back link, `DetailHeader`, then the two-column grid with
 * a sticky aside. Every guide is listed by `generateStaticParams`, so the
 * whole page prerenders complete — nothing on it loads.
 */
export default async function GuidePage({ params }: { params: Params }) {
  return (
    <Page className="flex flex-col gap-(--space-record)">
      <BackLink href="/docs" label="Docs" />
      <GuideDetail params={params} />
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
  const steps = await Promise.all(
    (GUIDE_STEPS[found.id] ?? []).map(resolveStep)
  )
  const previous = previousGuide(found.id)
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
        byline={
          found.loomId ? (
            <p className="eyebrow">Video · {found.length} walkthrough</p>
          ) : null
        }
        description={found.summary}
        title={found.title}
      />

      <div className="grid gap-(--space-block) lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <section className="flex min-w-0 flex-col gap-(--space-block)">
          {found.loomId ? (
            <GuideVideo loomId={found.loomId} title={found.title} />
          ) : null}

          <div className="flex max-w-3xl flex-col gap-(--space-sm)">
            <p className="type-body">{found.intro}</p>
            <p className="type-body rounded-2xl border border-dashed bg-surface px-4 py-3">
              <b className="type-emphasis text-foreground">Note. </b>
              <CodeText text={found.note} />
            </p>
          </div>

          <GuideSteps steps={steps} />
        </section>

        <aside className="flex flex-col gap-(--space-md) lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
          {/* The step list is for jumping around a long page beside it; on a
              phone it would sit under the steps it lists, so it is desktop
              only. The previous and next guides show everywhere. */}
          <section className="hidden flex-col gap-(--space-xs) lg:flex">
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

          {previous || next ? (
            <nav
              aria-label="More guides"
              className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1"
            >
              {previous ? (
                <GuideLink direction="previous" guide={previous} />
              ) : null}
              {next ? <GuideLink direction="next" guide={next} /> : null}
            </nav>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

/**
 * The previous and next guides: the same card, text always left-aligned, and
 * the back link's chevron on the side it leads to — left for previous, the
 * far right for next.
 */
function GuideLink({
  guide,
  direction,
}: {
  guide: Guide
  direction: 'previous' | 'next'
}) {
  const noun = guide.loomId ? 'video' : 'guide'
  const isNext = direction === 'next'
  const icon = (
    <HugeiconsIcon
      aria-hidden="true"
      className={cn(
        'shrink-0 text-soft transition-colors group-hover/guide:text-foreground',
        isNext && 'order-last'
      )}
      icon={isNext ? ArrowRight01Icon : ArrowLeft01Icon}
      size={16}
      strokeWidth={1.8}
    />
  )
  return (
    <Link
      className={cn(
        'group/guide focus-ring flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors hover:bg-hover',
        // The next guide sits on the right on a two-column row.
        isNext && 'sm:col-start-2 lg:col-start-auto'
      )}
      href={guidePath(guide)}
      rel={isNext ? 'next' : 'prev'}
    >
      {icon}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="type-label text-faint">
          {isNext ? `Next ${noun}` : `Previous ${noun}`}
        </span>
        <span className="type-item truncate">{guide.title}</span>
      </span>
    </Link>
  )
}
