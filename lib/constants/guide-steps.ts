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
      '`capability` lists your function next to every other vendor’s version of the same job, so it must be one of the capabilities in `tags.yml`, the one file that holds every tag. Look there first. If none fits, add an entry — a label and a few synonyms — in the same pull request.',
  },
  {
    key: 'one-function',
    title: 'Create one file per function',
    detail:
      'Name the file after the function it calls. Apollo enriching a person, searching for people and enriching a company is three files, not one product page. The path is the tool’s key, and the key is its URL.',
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
      'A tool file is a YAML header between `---` lines and nothing else. Unknown fields are rejected, so a typo fails the check with the file path instead of silently vanishing. `name` says what the function does, starting with a verb (“Enrich a person”), and the `summary` is one sentence about what the call returns or changes. When there is something to know before calling — an id to fetch first, a result to poll for, a cost — say it in `notes`, one line; every workflow that uses the tool prints it.',
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
      '`mcp`, `cli` and `api` name the exact call on each way in that your `company.md` declares: the MCP tool name, the CLI command (starting with the binary), or `METHOD /path` for an API — exactly as the vendor’s docs print it, with `docs` pointing at the page that names it. A published tool needs at least one call and a `docs` page; until it has both, set `status: draft`. A draft has no page and no file.',
    sample: { file: 'companies/stripe/company.md', excerpt: 'header' },
  },
  {
    key: 'updated',
    title: 'Date it',
    detail:
      'Set `updated` to the day you last checked the facts, as `YYYY-MM-DD`. A workflow’s date is the newest of its own and its tools’ dates, so this date also moves every workflow that uses the tool.',
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
      'Phrase the `title` as the result it reaches, not the tools it uses. The `summary` is one sentence. `author` is your GitHub login — workflows are by people, not companies, so the page shows your avatar and links to your profile. Under `tags`, add the motion and channel it serves (`motion:outbound`, `channel:email`) from `tags.yml`; its capabilities come from its tools.',
    // `featured` is set by maintainers: never copied.
    sample: { file: WORKFLOW, excerpt: 'header', omit: ['featured'] },
  },
  {
    key: 'inputs',
    title: 'List what the agent must ask for',
    detail:
      'Under `## Inputs`, one line per input: its name in `snake_case` and backticks, a colon, then what it is. Add `, e.g.` and an example when it helps. Steps refer to an input by the same name in backticks, never as `{{templates}}`.',
    sample: { file: WORKFLOW, excerpt: '## Inputs' },
  },
  {
    key: 'steps',
    title: 'Write the steps',
    detail:
      'Under `## Steps`, a numbered list of one to ten steps: the step’s title in bold, “with” the tool it uses — a published tool’s key, linked to `../companies/<handle>/tools/<name>.md` — a full stop, then what to do with it. A step the agent does itself, like writing a draft, has no link. End a step with “Keep …” when a later step needs its result. Say what to do, not how the tool works: the tool’s own file already covers setup.',
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
      'Lowercase letters, digits and hyphens, 2–39 characters, and not a reserved word such as `tools`, `workflows`, `docs` or `mcp`. It becomes your company URL and the first half of every tool key, and it is permanent — a rename only ever redirects.',
    sample: {
      caption: 'companies/apollo/',
      code: `company.md
logo.webp
tools/enrich-person.md`,
    },
  },
  {
    key: 'company',
    title: 'Write company.md',
    detail:
      '`name`, a bare `domain` with no scheme, a `category` listed in `tags.yml`, and `updated`, the date you checked the facts. The body is a short description. Optional fields are shown when present — leave out anything you cannot verify publicly. Add your logo beside it as `logo.svg` (or png, jpg, webp) under 32 KB; without one, the site shows your initial.',
    sample: { file: 'companies/apollo/company.md' },
  },
  {
    key: 'ways',
    title: 'Say how an agent reaches you',
    detail:
      'In the same header, `mcp`, `cli` and `api` describe each way into your product, once, for every tool to share: the MCP server’s URL or command, the CLI’s install command and binary, the API’s base URL — each with how it authenticates. An API key names the environment variable it goes in, never the key; a remote MCP server signs in with `oauth` or needs `none` — if it takes a key, list your API instead. A community-run way in names its `maintainer`.',
    sample: { file: 'companies/stripe/company.md', excerpt: 'header' },
  },
  {
    key: 'tools',
    title: 'Add your tools',
    detail:
      'Every function an agent can call gets its own file under `tools/`, named after the function and naming its exact call on each way in. That is the “Add a tool” guide, repeated once per function.',
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
