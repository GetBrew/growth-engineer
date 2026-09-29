import type { EntityKind } from '@/components/common/entity-icon'
import type { ResolvedGuideStep } from '@/lib/constants/guide-steps'
import { GITHUB_URL, repoFileUrl } from '@/lib/github'

/**
 * The contribute guides, one per kind of entry someone can add, each at its
 * own top-level URL (`/add-a-workflow`).
 *
 * PURE MODULE: data only. The list page draws these as rows and the detail
 * route generates one page per `slug`, so the two cannot disagree about which
 * guides exist. Order is the order they are read in, which is what the
 * previous and next links at the foot of each page follow.
 */
export type Guide = {
  id: string

  /** The page's own top-level URL: `/<slug>` (`app/(site)/(docs)/<slug>`). */
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

  /** The agent skill that does it end to end, in `.agents/skills/`. */
  skill: string

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
      'Turn a play your team already runs into one file any agent can follow.',
    length: 'four-minute',
    intro:
      'A workflow is up to ten steps that reach one result. Each step either uses a published tool or is something the agent does itself, like writing a draft.',
    note: 'If a step calls a service, it must link a published tool. Otherwise the check rejects the file.',
    docPath: 'workflows/README.md',
    skill: 'add-workflow',
  },
  {
    id: 'tool',
    slug: 'add-a-tool',
    entity: 'tool',
    title: 'Add a tool',
    summary:
      'Describe one thing your product can do, and how an agent calls it.',
    length: 'three-minute',
    intro:
      'A tool is one action an agent can call: one MCP tool, one CLI command or one API endpoint. A product with three actions needs three tool files.',
    note: 'Its `capability` must be in `tags.yml`. If none fits, add one there in the same pull request.',
    docPath: 'companies/README.md#toolsnamemd',
    skill: 'research-company',
  },
  {
    id: 'company',
    slug: 'add-your-company',
    entity: 'company',
    title: 'Add your company',
    summary:
      'List your company, how agents connect to it, and the tools it offers.',
    length: 'five-minute',
    intro:
      'A company is one folder named after its handle. It holds who you are, how an agent connects to your product, and one file for each action an agent can call.',
    note: 'Your handle is permanent. It is your URL and the first part of every tool key. Renaming it only adds a redirect.',
    docPath: 'companies/README.md',
    skill: 'research-company',
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
  return `/${guide.slug}`
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
 * and what the MCP contribute prompt hands over. It gives an agent everything
 * it needs to start — the repository, the reference, the skill that does it
 * end to end — then each step with the real file it quotes, so the syntax is
 * shown, not described. `extra` is a section the caller adds before the steps.
 */
export function guideMarkdown(
  guide: Guide,
  resolvedSteps: ReadonlyArray<ResolvedGuideStep>,
  extra = ''
): string {
  const steps = resolvedSteps
    .map((step, index) => {
      const sample = step.sample
        ? `\n\n\`${step.sample.caption}\`:\n\n\`\`\`\n${step.sample.code}\n\`\`\``
        : ''
      return `### ${index + 1}. ${step.title}\n\n${step.detail}${sample}`
    })
    .join('\n\n')
  const start = [
    `Work in a clone of ${GITHUB_URL}.`,
    `Read ${guideDocUrl(guide)} first: it has every field and a template to copy.`,
    `The \`${guide.skill}\` skill does this end to end: ${repoFileUrl(`.agents/skills/${guide.skill}/SKILL.md`)}.`,
    'Run `pnpm content:check` before opening the pull request: it names every problem with its file.',
  ]
    .map((line) => `- ${line}`)
    .join('\n')
  const more = extra ? `\n\n${extra.trim()}` : ''
  return `# ${guide.title}\n\n${guide.intro}\n\n## Before you start\n\n${start}${more}\n\n## How to create\n\n${steps}\n`
}
