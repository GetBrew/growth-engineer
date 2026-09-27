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
  'One command parses every file, resolves every reference and renders the result. It reports every problem at once, each with the file that caused it (and the line, for a problem in the body). The same checks run again in CI on your pull request.'

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
      'capability: puts your function on a shelf next to every other vendor’s version of the same job, so it must be listed under capability: in tags.yml, the one file that holds every tag. Look there first. If nothing fits what your function does, add an entry — a label and a few synonyms — in the same pull request.',
  },
  {
    key: 'one-function',
    title: 'Create one file per function',
    detail:
      'A tool is ONE thing an agent calls — one MCP tool, one CLI command, or one API endpoint — and its file is named after that function. Apollo enriching a person, searching for people and enriching a company is three files, not one product page. The path is the key, and the key is the URL.',
    sample: {
      caption: 'companies/apollo/tools/',
      code: `enrich-person.md
search-people.md
enrich-company.md`,
    },
  },
  {
    key: 'header',
    title: 'Write the header',
    detail:
      'A YAML header between --- lines, then an optional markdown body that describes the function. Unknown fields are rejected, so a typo fails the check with the file path instead of silently vanishing. The summary is one sentence saying what the function does, in words someone can act on.',
    sample: { file: 'companies/apollo/tools/enrich-person.md' },
  },
  {
    key: 'calls',
    title: 'Name the call on each way in',
    detail:
      'mcp:, cli: and api: name the exact call on each way in your company.md declares: the MCP tool name, the CLI command (starting with the binary), or METHOD /path for an API — exactly as the vendor’s docs print it, with docs: pointing at the page that names it. A published tool needs at least one call and a docs: page; until it has both, set status: draft — a draft has no page and no file.',
    sample: { file: 'companies/stripe/company.md', excerpt: 'header' },
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
    sample: checkSample('/tools/apollo/enrich-person'),
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
      'Phrase the title as the result it reaches, not the tools it uses. The summary is one sentence. author is your GitHub login — workflows are by people, not companies, so the page shows your avatar and links to your profile. Tag it with the motion and channel it serves (motion:outbound, channel:email) from tags.yml; the capabilities come from its tools.',
    sample: { file: WORKFLOW, excerpt: 'header' },
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
      'Under ## Steps, a numbered list: the step’s title in bold, “with” the tool it uses — a published tool’s key, linked to its file — then what to do with it. Say what to do, not how the tool works: the tool’s own file already covers setup. The build links every step to its tool, and every tool page back to the workflows that use it.',
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
      'Lowercase letters, digits and hyphens, 2–39 characters, and not a reserved word such as tools, workflows or mcp. It becomes your company URL and the first half of every tool key, and it is permanent — a rename only ever redirects.',
    sample: {
      caption: 'companies/apollo/',
      code: `company.md
tools/enrich-person.md`,
    },
  },
  {
    key: 'company',
    title: 'Write company.md',
    detail:
      'Name, bare domain with no scheme, a category listed in tags.yml, a logo file you add to public/logos/, and the date you checked the facts. The body is a short description. Optional fields are shown when present — leave out anything you cannot verify publicly.',
    sample: { file: 'companies/apollo/company.md' },
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
    title: 'Add your tools',
    detail:
      'Every function an agent can call gets its own file under tools/, named after the function and naming its exact call on each way in. That is the "Add a tool" guide, repeated once per function.',
    sample: {
      caption: 'companies/apollo/tools/',
      code: `enrich-person.md
search-people.md
enrich-company.md`,
    },
  },
  {
    key: 'check',
    title: 'Check it locally',
    detail: CHECK_DETAIL,
    sample: checkSample('/companies/apollo'),
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
