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
  | { file: string; excerpt?: Excerpt }
  | { caption?: string; code: string }

export type GuideStep = {
  key: string
  title: string
  detail: string
  sample?: GuideSample
}

const CHECK_DETAIL =
  'One command parses every file, resolves every reference and renders the result. It reports every problem at once, each with the file and line that caused it. The same checks run again in CI on your pull request.'

const PR_DETAIL =
  'One company, tool or workflow per pull request keeps the review quick. Say what you added and how you checked the facts. Maintainers review for accuracy, not for style — the build owns style.'

const TOOL_STEPS: ReadonlyArray<GuideStep> = [
  {
    key: 'capability',
    title: 'Pick the capability it performs',
    detail:
      'capability: puts your function on a shelf next to every other vendor’s version of the same job, so it must be listed under capability: in tags.yml, the one file that holds every tag. Look there first. If nothing fits what your function does, add an entry — a label and a few synonyms — in the same pull request.',
  },
  {
    key: 'one-function',
    title: 'Create one file per function',
    detail:
      'A tool is ONE thing an agent calls — one MCP tool, one CLI command, or one API endpoint — and its file is named after that function. Clay enriching contacts, building an audience and finding work emails is three files, not one product page. The path is the key, and the key is the URL.',
    sample: {
      code: `companies/clay/tools/enrich-contacts.md
companies/clay/tools/build-audience.md
companies/clay/tools/find-work-emails.md`,
    },
  },
  {
    key: 'header',
    title: 'Write the header',
    detail:
      'A YAML header between --- lines, then an optional markdown body that describes the function. Unknown fields are rejected, so a typo fails the check with the file path instead of silently vanishing. The summary is one sentence saying what the function does, in words someone can act on.',
    sample: { file: 'companies/clay/tools/enrich-contacts.md' },
  },
  {
    key: 'calls',
    title: 'Name the call on each way in',
    detail:
      'mcp:, cli: and api: name the exact call on each way in your company.md declares: the MCP tool name, the CLI command (starting with the binary), or METHOD /path for an API — exactly as the vendor’s docs print it, with docs: pointing at the page that names it. A published tool needs at least one call; until it has one, set status: draft — a draft has no page and no file.',
    sample: { file: 'companies/stripe/company.md', excerpt: 'header' },
  },
  {
    key: 'updated',
    title: 'Date it',
    detail:
      'updated is the day you last checked these facts, as YYYY-MM-DD. It is required, and it travels: a workflow file’s date is the newest of the tools it uses, so this date moves every workflow page built on your tool.',
    sample: { code: 'updated: 2026-09-16' },
  },
  {
    key: 'check',
    title: 'Check it locally',
    detail: CHECK_DETAIL,
    sample: {
      code: `pnpm install
pnpm content:check
pnpm dev   # then open /tools/clay/enrich-contacts`,
    },
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
    title: 'Create one file, in a flat folder',
    detail:
      'workflows/ has no subfolders. The file name is the key and the URL, and it never changes once published — a rename adds the old name under aliases and the old URL redirects.',
    sample: {
      code: `workflows/funding-signal-outbound.md
workflows/at-risk-customer-rescue.md
workflows/competitor-intent.md`,
    },
  },
  {
    key: 'header',
    title: 'Write the header',
    detail:
      'Phrase the title as the result it reaches, not the tools it uses. The summary is one sentence. author is your GitHub login — workflows are by people, not companies, so the page shows your avatar and links to your profile. Tag it with the motion and channel it serves (motion:outbound, channel:email) from tags.yml; the capabilities come from its tools.',
    sample: { file: WORKFLOW, excerpt: 'header' },
  },
  {
    key: 'inputs',
    title: 'Name what the agent must ask for',
    detail:
      'Under ## Inputs, one line per input: its name in snake_case, in backticks, then what it is and, after “e.g.”, an example — so the agent can ask the user a clear question instead of guessing. Steps refer to inputs by the same name in backticks, never as {{templates}}.',
    sample: { file: WORKFLOW, excerpt: '## Inputs' },
  },
  {
    key: 'steps',
    title: 'Write one to ten steps',
    detail:
      'Under ## Steps, a numbered list: the step’s title in bold, “with” the tool it uses — a published tool’s key, linked to its file — then what to do with it. Say what to do, not how the tool works: the tool’s own file already covers setup. The build links every step to its tool, and every tool page back to the workflows that use it.',
    sample: { file: WORKFLOW, excerpt: '## Steps' },
  },
  {
    key: 'done',
    title: 'Say when the job is done',
    detail:
      'Under ## Done when, at least one check — the condition that means it finished. Do not write rules about asking before sending, spending or changing data: the rendered file adds those itself, last, and nobody can edit them.',
    sample: { file: WORKFLOW, excerpt: '## Done when' },
  },
  {
    key: 'check',
    title: 'Check it locally',
    detail: CHECK_DETAIL,
    sample: {
      code: `pnpm install
pnpm content:check
pnpm dev   # then open /workflows/funding-signal-outbound`,
    },
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
      'Lowercase letters, digits and hyphens, 2–39 characters, and not a reserved word such as tools, workflows or map. It becomes your company URL and the first half of every tool key, and it is permanent — a rename only ever redirects.',
    sample: {
      code: `companies/clay/
  company.md
  tools/enrich-contacts.md`,
    },
  },
  {
    key: 'company',
    title: 'Write company.md',
    detail:
      'Name, bare domain with no scheme, a category listed in tags.yml, a logo file you add to public/logos/, and the date you checked the facts. The body is a short description. Optional fields are shown when present — leave out anything you cannot verify publicly.',
    sample: { file: 'companies/clay/company.md' },
  },
  {
    key: 'ways',
    title: 'Say how an agent reaches you',
    detail:
      'In the same header, mcp:, cli: and api: describe each door into your product, once, for every tool to share: the MCP server’s URL or command, the CLI’s install command and binary, the API’s base URL — each with how it authenticates. An API key names the environment variable it goes in, never the key. Community-run doors say who maintains them.',
    sample: { file: 'companies/stripe/company.md', excerpt: 'header' },
  },
  {
    key: 'tools',
    title: 'Add one file per function',
    detail:
      'Every function an agent can call gets its own file under tools/, named after the function and naming its exact call on each way in. That is the "Add a tool" guide, repeated once per function.',
    sample: {
      code: `companies/clay/tools/enrich-contacts.md
companies/clay/tools/build-audience.md
companies/clay/tools/find-work-emails.md`,
    },
  },
  {
    key: 'check',
    title: 'Check it locally',
    detail: CHECK_DETAIL,
    sample: {
      code: `pnpm install
pnpm content:check
pnpm dev   # then open /companies/clay`,
    },
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
