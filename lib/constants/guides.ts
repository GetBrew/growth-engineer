import type { EntityKind } from '@/components/common/entity-icon'
import { GUIDE_STEPS } from '@/lib/constants/guide-steps'
import { repoFileUrl } from '@/lib/github'

/**
 * The guides on `/contribute`, one per kind of entry someone can add.
 *
 * PURE MODULE: data only. The list page draws these as rows and the detail
 * route generates one page per `id`, so the two cannot disagree about which
 * guides exist. Order is the order they are watched in, which is what the
 * "Next video" link at the foot of each page follows.
 */
export type Guide = {
  id: string
  entity: EntityKind
  title: string
  summary: string

  /** Spoken length of the walkthrough, e.g. "four-minute"; shown with the video. */
  length: string

  /** The line under the video, before the chapters. */
  intro: string

  /** The one thing that trips people up, called out under the intro. */
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
    entity: 'workflow',
    title: 'Add a workflow',
    summary:
      'Turn the steps you already run into one file any agent can follow.',
    length: 'four-minute',
    intro:
      'A workflow is up to ten steps, each naming one published tool, written as the result it reaches. These are the moves from an empty file to a merged pull request.',
    note: 'Every step must name a tool that already exists and is published, or the build rejects the file.',
    docPath: 'workflows/README.md',
  },
  {
    id: 'tool',
    entity: 'tool',
    title: 'Add a tool',
    summary:
      'Describe one function your product exposes, and how an agent reaches it.',
    length: 'three-minute',
    intro:
      'A tool is ONE function an agent calls — one MCP tool, one CLI subcommand, one API endpoint. A product with three functions is three files.',
    note: 'The file name must be a capability that already exists under tags/capability/. If none fits, add it in the same pull request.',
    docPath: 'companies/README.md#toolsslugmd',
  },
  {
    id: 'company',
    entity: 'company',
    title: 'Add your company',
    summary: 'List your company, the ways into it, and the tools it makes.',
    length: 'five-minute',
    intro:
      'A company is a folder named by its handle, holding who you are, every way into your product, and one file per function an agent can call.',
    note: 'The handle is permanent: it becomes your URL and the first half of every tool key. A rename only ever redirects.',
    docPath: 'companies/README.md',
  },
]

/** Where the guide's file lives on GitHub. */
export function guideDocUrl(guide: Guide): string {
  return repoFileUrl(guide.docPath)
}

export function findGuide(id: string): Guide | undefined {
  return GUIDES.find((guide) => guide.id === id)
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
