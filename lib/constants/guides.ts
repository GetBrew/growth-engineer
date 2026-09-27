import type { EntityKind } from '@/components/common/entity-icon'
import { GUIDE_STEPS } from '@/lib/constants/guide-steps'
import { repoFileUrl } from '@/lib/github'

/**
 * The contribute guides in `/docs`, one per kind of entry someone can add.
 *
 * PURE MODULE: data only. The list page draws these as rows and the detail
 * route generates one page per `id`, so the two cannot disagree about which
 * guides exist. Order is the order they are watched in, which is what the
 * "Next video" link at the foot of each page follows.
 */
export type Guide = {
  id: string

  /** The URL segment: `/docs/<slug>`. */
  slug: string
  entity: EntityKind
  title: string
  summary: string

  /** Spoken length of the walkthrough, e.g. "four-minute"; shown with the video. */
  length: string

  /** The line under the video, before the chapters. */
  intro: string

  /** The one thing that trips people up, called out under the intro. `Backticks` mark code. */
  note: string

  /** The file on GitHub this guide is about; what "View on GitHub" opens. */
  docPath: string

  /**
   * The Loom share id of the walkthrough, once it is recorded. Absent means
   * the page has no video slot and makes no mention of one.
   */
  loomId?: string
}

export const GUIDES: ReadonlyArray<Guide> = [
  {
    id: 'workflow',
    slug: 'add-a-workflow',
    entity: 'workflow',
    title: 'Add a workflow',
    summary:
      'Turn the steps you already run into one file any agent can follow.',
    length: 'four-minute',
    intro:
      'A workflow is one to ten steps that reach a result. Each step uses one published tool and says what to do with it.',
    note: 'Every step must name a published tool, or the check rejects the file.',
    docPath: 'workflows/README.md',
  },
  {
    id: 'tool',
    slug: 'add-a-tool',
    entity: 'tool',
    title: 'Add a tool',
    summary:
      'Describe one function your product exposes, and how an agent reaches it.',
    length: 'three-minute',
    intro:
      'A tool is one function an agent calls: one MCP tool, one CLI command or one API endpoint. A product with three functions has three tool files.',
    note: 'The file name must match a capability in `tags/capability/`. If none fits, add one in the same pull request.',
    docPath: 'companies/README.md#toolsslugmd',
  },
  {
    id: 'company',
    slug: 'add-your-company',
    entity: 'company',
    title: 'Add your company',
    summary: 'List your company, the ways into it, and the tools it makes.',
    length: 'five-minute',
    intro:
      'A company is one folder, named by its handle. It holds who you are, each way into your product, and one file per function an agent can call.',
    note: 'The handle is permanent: it is your URL and the first half of every tool key. A rename only adds a redirect.',
    docPath: 'companies/README.md',
  },
]

/** Where the guide's file lives on GitHub. */
export function guideDocUrl(guide: Guide): string {
  return repoFileUrl(guide.docPath)
}

/** A guide by its URL segment. */
export function findGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug)
}

/** Where a guide lives on the site. */
export function guidePath(guide: Guide): string {
  return `/docs/${guide.slug}`
}

/** The guide before this one, or undefined at the start of the series. */
export function previousGuide(id: string): Guide | undefined {
  const index = GUIDES.findIndex((guide) => guide.id === id)
  return index > 0 ? GUIDES[index - 1] : undefined
}

/** The guide watched after this one, or undefined at the end of the series. */
export function nextGuide(id: string): Guide | undefined {
  const index = GUIDES.findIndex((guide) => guide.id === id)
  return index === -1 ? undefined : GUIDES[index + 1]
}

/**
 * The guide as one markdown file: what the agent menu copies and downloads,
 * the way it copies a tool or workflow file on the catalog's detail pages.
 */
export function guideMarkdown(guide: Guide): string {
  const steps = (GUIDE_STEPS[guide.id] ?? [])
    .map((step, index) => `${index + 1}. ${step.title}\n\n${step.detail}`)
    .join('\n\n')
  return `# ${guide.title}\n\n${guide.intro}\n\n## How to create\n\n${steps}\n`
}
