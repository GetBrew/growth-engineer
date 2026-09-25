/**
 * What a contributor does, in order, with enough detail and a real example
 * that they never have to leave the page to get it right.
 *
 * PURE MODULE: data only. Written from the folder READMEs
 * (`workflows/README.md`, `companies/README.md`), which stay the exhaustive
 * field reference — a guide links to its own with "View on GitHub".
 *
 * Every sample is a REAL published entry, copied from the file in this
 * repository, not an illustration: `companies/clay/`,
 * `companies/clay/tools/enrich-contacts.md` and
 * `workflows/funding-signal-outbound.md`. A reader can open the page beside
 * the sample and see the same thing.
 */
export type GuideStep = {
  key: string
  title: string
  detail: string

  /**
   * The path of the file `code` belongs to, shown as a caption above it.
   * Absent when the sample is a command rather than a file.
   */
  file?: string

  /** The sample itself: the file's real contents, or the command to run. */
  code?: string
}

const CHECK_DETAIL =
  'One command parses every file, resolves every reference and renders the result. It reports every problem at once, each with the path of the file that caused it. The same checks run again in CI on your pull request.'

const PR_DETAIL =
  'One company, tool or workflow per pull request keeps the review quick. Say what you added and how you checked the facts. Maintainers review for accuracy, not for style — the build owns style.'

const TOOL_STEPS: ReadonlyArray<GuideStep> = [
  {
    key: 'capability',
    title: 'Pick the capability it performs',
    detail:
      'The file name is the capability, and it must already exist as a file under tags/capability/. Look there first. If nothing fits what your function does, add the capability file in the same pull request.',
    file: 'tags/capability/enrich-contacts.md',
    code: `---
label: Enrich contacts
synonyms:
  - enrich
  - enrichment
  - data enrichment
---

Adds firmographic and person data to a contact or account.`,
  },
  {
    key: 'one-function',
    title: 'Create one file per function',
    detail:
      'A tool is ONE thing an agent calls — one MCP tool, one CLI subcommand, or one API endpoint. Clay enriching contacts, building an audience and finding work emails is three files, not one product page. The path is the key, and the key is the URL.',
    code: `companies/clay/tools/enrich-contacts.md
companies/clay/tools/build-audience.md
companies/clay/tools/find-work-emails.md`,
  },
  {
    key: 'header',
    title: 'Write the header',
    detail:
      'A YAML header between --- lines, then an optional markdown body. Unknown fields are rejected, so a typo fails the check with the file path instead of silently vanishing. The summary is one sentence saying what the function does, in words someone can act on.',
    file: 'companies/clay/tools/enrich-contacts.md',
    code: `---
name: Enrich contacts
summary: Adds firmographic and person data to a contact or account. Clay does this.
access:
  api: POST /enrich-contacts
updated: 2026-09-16
---`,
  },
  {
    key: 'access',
    title: 'Map every way in to its exact operation',
    detail:
      'access points an id from the company’s access/ folder at the precise operation: the MCP tool name, the CLI subcommand, or METHOD /path for an API. The id on the left has to be a file that exists. A published tool needs at least one way in — with none it stays a draft and has no page.',
    file: 'companies/clay/access/api.md',
    code: `---
type: api
official: true
baseUrl: https://api.clay.com
auth:
  method: api_key
  envVar: CLAY_API_KEY
  selfServe: true
---`,
  },
  {
    key: 'updated',
    title: 'Date it',
    detail:
      'updated is the day you last checked these facts, as YYYY-MM-DD. It is required, and it travels: a workflow file’s date is the newest of the tools it uses, so this date moves every workflow page built on your tool.',
    code: 'updated: 2026-09-16',
  },
  {
    key: 'check',
    title: 'Check it locally',
    detail: CHECK_DETAIL,
    code: `pnpm install
pnpm content:check
pnpm dev   # then open /tools/clay/enrich-contacts`,
  },
  {
    key: 'pr',
    title: 'Open a pull request',
    detail: PR_DETAIL,
  },
]

const WORKFLOW_STEPS: ReadonlyArray<GuideStep> = [
  {
    key: 'file',
    title: 'Create one file, in a flat folder',
    detail:
      'workflows/ has no subfolders. The file name is the key and the URL, and it never changes once published — a rename adds the old name under aliases and the old URL redirects.',
    code: `workflows/funding-signal-outbound.md
workflows/at-risk-customer-rescue.md
workflows/competitor-intent.md`,
  },
  {
    key: 'header',
    title: 'Write the header',
    detail:
      'Phrase the title as the result it reaches, not the tools it uses. The summary is one sentence. author is your GitHub login — workflows are by people, not companies, so the page shows your avatar and links to your profile. Tag it with at least one namespace:slug that exists under tags/.',
    file: 'workflows/funding-signal-outbound.md',
    code: `---
title: Turn fresh funding news into qualified outbound
summary: Find recently funded teams, enrich the right buyers, and send a relevant message while the signal is still fresh.
author: thedogwiththedataonit
version: 1
tags:
  - motion:outbound
  - channel:email
  - capability:enrich-contacts
updated: 2026-09-16
---`,
  },
  {
    key: 'inputs',
    title: 'Name what the agent must ask for',
    detail:
      'Inputs are named in snake_case and referenced in backticks inside the steps — never as {{templates}}. Give each one a description and an example, so the agent can ask the user a clear question instead of guessing.',
    code: `inputs:
  - name: target_segment
    description: the kind of company to watch
    example: Series A B2B SaaS in the US
  - name: sender_email
    description: the address emails are sent from`,
  },
  {
    key: 'steps',
    title: 'Write one to ten steps',
    detail:
      'Each step names one tool that already exists and is published, and says what to do with it — not how the tool works, because the tool’s own file already covers setup. Add via when a step needs a particular way in. The build links every step to its tool, and every tool page back to the workflows that use it.',
    code: `steps:
  - title: Find funded companies
    tool: clay/build-audience
    instruction: List companies matching \`target_segment\` that announced a round in the last 30 days.
  - title: Find the buyer
    tool: apollo/find-work-emails
    instruction: For each company, find the head of growth or marketing.
  - title: Send
    tool: brew/send-email
    instruction: After the user approves, send each email from \`sender_email\`.`,
  },
  {
    key: 'done',
    title: 'Say when the job is done',
    detail:
      'At least one check under doneWhen — the condition that means it finished. Do not write rules about asking before sending, spending or changing data: the rendered file adds those itself, last, and nobody can edit them.',
    code: `doneWhen:
  - Every funded company has a contact, or a note explaining why not.
  - Approved emails are sent, and the user has a summary table.`,
  },
  {
    key: 'check',
    title: 'Check it locally',
    detail: CHECK_DETAIL,
    code: `pnpm install
pnpm content:check
pnpm dev   # then open /workflows/funding-signal-outbound`,
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
    code: `companies/clay/
  company.md
  access/api.md
  tools/enrich-contacts.md`,
  },
  {
    key: 'company',
    title: 'Write company.md',
    detail:
      'Name, bare domain with no scheme, a category that exists under tags/category/, a logo file you add to public/logos/, and the date you checked the facts. Optional fields are shown when present — leave out anything you cannot verify publicly.',
    file: 'companies/clay/company.md',
    code: `---
name: Clay
domain: clay.com
category: data-provider
tagline: Enrich people and companies with data from many providers, then build lists from the results.
logo: clay.png
updated: 2026-09-16
---

Clay is a go-to-market data platform that centralizes first- and third-party
data and delivers real-time signals such as job changes and promotions.`,
  },
  {
    key: 'access',
    title: 'Add one file per way in',
    detail:
      'Each file under access/ is one door into your product: the MCP server, the CLI, the API. The file name is the id your tools refer to. Say how it authenticates and whether someone can sign up for it themselves; community-maintained options say who maintains them.',
    file: 'companies/clay/access/api.md',
    code: `---
type: api
official: true
baseUrl: https://api.clay.com
auth:
  method: api_key
  envVar: CLAY_API_KEY
  selfServe: true
---`,
  },
  {
    key: 'tools',
    title: 'Add one file per function',
    detail:
      'Every function an agent can call gets its own file under tools/, named after a capability and naming the exact operation for each way in. That is the "Add a tool" guide, repeated once per function.',
    code: `companies/clay/tools/enrich-contacts.md
companies/clay/tools/build-audience.md
companies/clay/tools/find-work-emails.md`,
  },
  {
    key: 'check',
    title: 'Check it locally',
    detail: CHECK_DETAIL,
    code: `pnpm install
pnpm content:check
pnpm dev   # then open /companies/clay`,
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
