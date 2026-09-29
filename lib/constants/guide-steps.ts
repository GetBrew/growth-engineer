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

/** A step with its sample resolved: a quoted file, or a command. */
export type ResolvedGuideStep = Omit<GuideStep, 'sample'> & {
  sample?: { caption: string; code: string }
}

const CHECK_DETAIL =
  'Run one command to check everything. It reads every file, checks every link and builds the pages, then lists every problem at once with the file (and line) that caused it. The same check runs again on your pull request.'

const PR_DETAIL =
  'Send one company, tool or workflow per pull request. Say what you added and how you checked the facts. Reviewers check the facts, and the build handles formatting.'

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
      'Each tool has one `capability`, which puts it next to other vendors that do the same job. Pick one from `tags.yml`, the file that lists every tag. If none fits, add a new entry with a label and a few synonyms in the same pull request.',
  },
  {
    key: 'one-function',
    title: 'Create one file per function',
    detail:
      'Name the file after the action it performs. Apollo can enrich a person, search for people and enrich a company, so that is three files, not one product page. The file path is the tool’s key and its URL.',
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
      'A tool file is only a YAML header between two `---` lines. Unknown fields are rejected, so a typo fails the check and names the file. Start `name` with a verb, like “Enrich a person”. Keep `summary` to one sentence about what the call returns or changes. If there is something to know before calling, such as an ID to fetch first, a result to wait for, or a cost, add it to `notes` in one line. Every workflow that uses the tool shows it.',
    // `aliases` belongs to this file alone: copied, it claims a key twice.
    sample: {
      file: 'companies/apollo/tools/enrich-person.md',
      excerpt: 'header',
      omit: ['aliases'],
    },
  },
  {
    key: 'calls',
    title: 'Name the call on each way in',
    detail:
      'For each way in that your `company.md` declares, name the exact call: the MCP tool name under `mcp`, the CLI command (starting with the program name) under `cli`, or `METHOD /path` under `api`. Write it exactly as the vendor’s docs do, and point `docs` at that page. A published tool needs at least one call and a `docs` link. Until then, set `status: draft`. A draft gets no page and no file.',
    sample: { file: 'companies/stripe/company.md', excerpt: 'header' },
  },
  {
    key: 'updated',
    title: 'Date it',
    detail:
      'Set `updated` to the day you last checked the facts, as `YYYY-MM-DD`. A workflow takes the newest date of its tools, so this also updates every workflow that uses the tool.',
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
      'Add one file to `workflows/`. The folder has no subfolders. The file name becomes the workflow’s key and URL. To rename it later, list the old name under `aliases` so the old URL still works.',
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
      'Write the `title` as the result it reaches, verb first, in 60 characters or fewer, not the tools it uses. Keep `summary` to one sentence of 140 characters or fewer that says what it does, like “Finds X, does Y, and Z in <tool>.” Set `author` to your GitHub login, so the page shows your avatar and links to your profile. Set `motion` to the one motion it serves from `tags.yml`, like `outbound`, and under `tags` add the channels it reaches people on, like `channel:email`. Its capabilities come from its tools automatically.',
    // `featured` is set by maintainers: never copied.
    sample: { file: WORKFLOW, excerpt: 'header', omit: ['featured'] },
  },
  {
    key: 'outcome',
    title: 'Say what the user gets',
    detail:
      'Start the body with `## Outcome`: one to four things the user has when the run ends, like a table, drafts, records or sent messages. The agent treats them as the checks that mean it is done. Name only what the steps produce, never a promise like replies or meetings. Leave out safety rules like asking before sending: every file adds them at the end.',
    sample: { file: WORKFLOW, excerpt: '## Outcome' },
  },
  {
    key: 'inputs',
    title: 'List what the agent must ask for',
    detail:
      'Under `## Inputs`, write one line per input: its name in `snake_case` and backticks, a colon, then what it is. Add “, e.g.” and an example. Ask for what the user knows, like a campaign’s name, when the agent can look up the id. If something must be set up once first, like a campaign template or a CRM property, say so. Steps refer to an input by the same name in backticks, never as `{{templates}}`.',
    sample: { file: WORKFLOW, excerpt: '## Inputs' },
  },
  {
    key: 'steps',
    title: 'Write the steps',
    detail:
      'Under `## Steps`, write a numbered list of one to ten steps. Each step starts with a bold title, then “with” and the tool it uses, linked to `../companies/<handle>/tools/<name>.md`, then a full stop and what to do. A step the agent does itself, like writing a draft, has no link. If a later step needs a result, end the step with “Keep …”. Say what to do, not how the tool works. The tool’s own file covers setup.',
    sample: { file: WORKFLOW, excerpt: '## Steps' },
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
      'Use lowercase letters, numbers and hyphens, 2 to 39 characters long. Reserved words such as `tools`, `workflows`, `docs` or `mcp` are not allowed. The handle becomes your company URL and the first part of every tool key. It is permanent, so a rename only adds a redirect.',
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
      'Add `name`, your bare `domain` (no `https://`), a `category` from `tags.yml`, and `updated`, the date you checked the facts. The body is a short description. Optional fields only show when filled in, so leave out anything you cannot verify publicly. Add your logo next to it as `logo.svg` (or png, jpg or webp): your current icon, square, under 32 KB, with fixed colours. A maintainer moves it to our CDN before merging.',
    sample: { file: 'companies/apollo/company.md' },
  },
  {
    key: 'ways',
    title: 'Say how an agent reaches you',
    detail:
      'In the same header, describe each way into your product once, under `mcp`, `cli` and `api`, so every tool can share it. Give the MCP server URL or command, the CLI install command and program name, or the API base URL, each with how it signs in. For an API key, name the environment variable it goes in, never the key itself. A remote MCP server signs in with `oauth` or needs `none`. If it needs a key, list your API instead. For a way in run by the community, name its `maintainer`.',
    sample: { file: 'companies/stripe/company.md', excerpt: 'header' },
  },
  {
    key: 'tools',
    title: 'Add your tools',
    detail:
      'Every action an agent can call gets its own file under `tools/`, named after the action, with its exact call on each way in. Follow the “Add a tool” guide once for each one.',
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
