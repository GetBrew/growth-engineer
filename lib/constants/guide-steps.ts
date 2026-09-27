import type { Excerpt } from '@/lib/catalog/source-excerpt'

/**
 * What a contributor does, in order, with enough detail and a real example
 * that they never have to leave the page to get it right.
 *
 * PURE MODULE: data only. Written from the folder READMEs
 * (`workflows/README.md`, `companies/README.md`), which stay the exhaustive
 * field reference — a guide links to its own with "View on GitHub".
 *
 * A sample that names a `file` is QUOTED from that file in this repository
 * at build time (`loadSourceExcerpt`), never copied here: the page shows what
 * the catalog actually holds, and a file that moves fails the build instead
 * of leaving a stale example behind. Only commands and folder listings are
 * written inline.
 */
type GuideSample =
  /**
   * Quoted from a file at build. `omit` drops top-level header fields a
   * contributor must NOT copy (a maintainer-only `featured`, say).
   */
  | { file: string; excerpt?: Excerpt; omit?: ReadonlyArray<string> }
  /** Written here: a command or a folder listing, named by its caption. */
  | { caption: string; code: string }

/**
 * `detail` is plain text in which `backticks` mark a file, folder, field or
 * value; the page sets those in code type, the way a README would.
 */
export type GuideStep = {
  key: string
  title: string
  detail: string
  sample?: GuideSample
}

const CHECK_DETAIL =
  'Run the check. It lists every problem at once, each with the file that caused it. CI runs the same check on your pull request.'

const PR_DETAIL =
  'Send one company, tool or workflow per pull request. Say what you added and how you checked the facts. Reviewers check accuracy; the build handles formatting.'

const TERMINAL = 'Terminal'

function checkSample(path: string): GuideSample {
  return {
    caption: TERMINAL,
    code: `pnpm install
pnpm content:check
pnpm dev   # then open ${path}`,
  }
}

const TOOL_STEPS: ReadonlyArray<GuideStep> = [
  {
    key: 'capability',
    title: 'Pick the capability',
    detail:
      'A tool is named after what it does. Find the matching file in `tags/capability/`: its name becomes your file name. If none fits, add a capability file in the same pull request.',
    sample: { file: 'tags/capability/enrich-contacts.md' },
  },
  {
    key: 'one-function',
    title: 'Create one file per function',
    detail:
      'Each function gets its own file under `companies/<handle>/tools/`. Clay enriches contacts, builds audiences and finds work emails, so it has three files. The path is the key and the URL.',
    sample: {
      caption: 'companies/clay/tools/',
      code: `enrich-contacts.md
build-audience.md
find-work-emails.md`,
    },
  },
  {
    key: 'header',
    title: 'Write the header',
    detail:
      'Give the tool a `name` and a one-sentence `summary` of what it does. Unknown fields fail the check, so a typo is caught. A markdown description below the header is optional.',
    sample: { file: 'companies/clay/tools/enrich-contacts.md' },
  },
  {
    key: 'access',
    title: 'Map each way in to its operation',
    detail:
      'Under `access`, pair each way in with the exact operation: the MCP tool name, the CLI command, or `METHOD /path` for an API, as the vendor’s docs write it. Each way in is a file in the company’s `access/` folder: `api` means `access/api.md`, shown here. A published tool needs at least one; until then, set `status: draft` and it stays hidden.',
    sample: { file: 'companies/clay/access/api.md' },
  },
  {
    key: 'updated',
    title: 'Date it',
    detail:
      'Set `updated` to the day you last checked the facts, as `YYYY-MM-DD`. A workflow shows the newest date among its tools, so this date updates every workflow that uses the tool.',
  },
  {
    key: 'check',
    title: 'Check it locally',
    detail: CHECK_DETAIL,
    sample: checkSample('/tools/clay/enrich-contacts'),
  },
  {
    key: 'pr',
    title: 'Open a pull request',
    detail: PR_DETAIL,
  },
]

const WORKFLOW = 'workflows/funding-signal-outbound.md'

const WORKFLOW_STEPS: ReadonlyArray<GuideStep> = [
  {
    key: 'file',
    title: 'Create the file',
    detail:
      'Add one file to `workflows/`, which has no subfolders. The file name becomes the key and the URL. To rename it later, list the old name under `aliases` and the old URL redirects.',
    sample: {
      caption: 'workflows/',
      code: `funding-signal-outbound.md
at-risk-customer-rescue.md
competitor-intent.md`,
    },
  },
  {
    key: 'header',
    title: 'Write the header',
    detail:
      'Name the result in `title`, not the tools. Keep `summary` to one sentence. Set `author` to your GitHub login, so the page shows your avatar. Add at least one tag from `tags/`, as `namespace:slug`. Start `version` at 1 and raise it when the steps change a lot. Leave out `featured`: maintainers set it.',
    sample: { file: WORKFLOW, excerpt: 'header', omit: ['featured'] },
  },
  {
    key: 'body',
    title: 'Lay out the body',
    detail:
      'Below the header come up to four sections, in this order. Only `## Steps` and `## Done when` are required. Any other heading fails the check, so a typo is caught.',
    sample: {
      caption: 'Section order',
      code: `## Inputs
## Steps
## Done when
## Notes`,
    },
  },
  {
    key: 'inputs',
    title: 'List what the agent must ask for',
    detail:
      'Under `## Inputs`, one line per input: its name in `snake_case` and backticks, then what it is. An example after `e.g.` is optional. Steps refer to an input by the same name in backticks, never as `{{templates}}`.',
    sample: { file: WORKFLOW, excerpt: '## Inputs' },
  },
  {
    key: 'steps',
    title: 'Write the steps',
    detail:
      'Under `## Steps`, a numbered list of one to ten steps. Each reads: the title in bold, `with` a published tool linked to its file, then what to do. To use one way in, add `via MCP`, `via CLI` or `via API` after the tool; the tool must offer it. Say what to do, not how the tool works: its own file covers setup.',
    sample: { file: WORKFLOW, excerpt: '## Steps' },
  },
  {
    key: 'done',
    title: 'Say when it is done',
    detail:
      'Under `## Done when`, list at least one check that means the job is finished. Leave out safety rules such as asking before sending: every file ends with them automatically.',
    sample: { file: WORKFLOW, excerpt: '## Done when' },
  },
  {
    key: 'check',
    title: 'Check it locally',
    detail: CHECK_DETAIL,
    sample: checkSample('/workflows/funding-signal-outbound'),
  },
  {
    key: 'pr',
    title: 'Open a pull request',
    detail: PR_DETAIL,
  },
]

const COMPANY_STEPS: ReadonlyArray<GuideStep> = [
  {
    key: 'handle',
    title: 'Choose the handle',
    detail:
      'Lowercase letters, digits and hyphens, 2 to 39 characters, and not a reserved word such as `tools` or `workflows`. It names your folder and your URL, and it is permanent: a rename only adds a redirect.',
    sample: {
      caption: 'companies/clay/',
      code: `company.md
access/api.md
tools/enrich-contacts.md`,
    },
  },
  {
    key: 'company',
    title: 'Write company.md',
    detail:
      'Add `name`, the bare `domain` (no `https://`), a `category` from `tags/category/`, a `logo` and `updated`. The logo goes in `public/logos/`: an SVG, or a PNG, JPG or WebP at most 128px square, under 32 KB. Links such as `website` and `docs` are optional; leave out anything you cannot verify. The body is a short description.',
    sample: { file: 'companies/clay/company.md' },
  },
  {
    key: 'access',
    title: 'Add one file per way in',
    detail:
      'Each file in `access/` is one way into your product: `mcp`, `cli` or `api`. Its file name is the id your tools use. Say how it authenticates and whether people can sign up on their own. For a community-maintained option, set `official: false` and name the `maintainer`.',
    sample: { file: 'companies/clay/access/api.md' },
  },
  {
    key: 'tools',
    title: 'Add your tools',
    detail:
      'Add one file per function under `tools/`. The “Add a tool” guide walks through each one.',
    sample: {
      caption: 'companies/clay/tools/',
      code: `enrich-contacts.md
build-audience.md
find-work-emails.md`,
    },
  },
  {
    key: 'check',
    title: 'Check it locally',
    detail: CHECK_DETAIL,
    sample: checkSample('/companies/clay'),
  },
  {
    key: 'pr',
    title: 'Open a pull request',
    detail: PR_DETAIL,
  },
]

export const GUIDE_STEPS: Record<string, ReadonlyArray<GuideStep>> = {
  workflow: WORKFLOW_STEPS,
  tool: TOOL_STEPS,
  company: COMPANY_STEPS,
}
