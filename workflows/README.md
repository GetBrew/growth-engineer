# workflows/

One file per workflow, flat: `workflows/<name>.md`, with no folders. The file
name is the key and the URL: `workflows/funding-signal-outbound.md` is
`funding-signal-outbound` at `/workflows/funding-signal-outbound`.

**Workflows are by people, not companies.** The `author` in the header is
your GitHub login; the page links to your profile and shows your avatar.
Keys never change once published; to rename, add the old name under
`aliases`.

A workflow is **several tools in order with the instructions that reach a
result**. A growth hack is a workflow; there is no second kind. A step
names one published tool (`companies/<handle>/tools/<name>.md`), or none when
the agent does it itself, such as drafting an email or picking the best
match. The build links both directions: every workflow page lists its tools,
and every tool page lists the workflows that use it.

## The file

A short YAML header with the facts, then the workflow itself in plain
markdown. It is the same markdown the published file uses, so what you write
here reads the same on GitHub as on the site. The build adds the setup for every
tool you name and the rules; you write the rest.

```markdown
---
title: Email buyers at newly funded companies
summary: Finds companies that just raised, picks the right buyer at each, and queues an approved email in lemlist.
author: jdoe
motion: outbound
tags:
  - channel:email
added: 2026-09-16
updated: 2026-09-16
---

## Outcome

- A table of every funded company with its buyer, or a note on why there is none.
- An approved email for each buyer, queued in your lemlist campaign.

## Inputs

- `target_segment`: the kind of company to watch, e.g. Series A B2B SaaS in the US
- `campaign`: the lemlist campaign that sends the emails, by name, e.g. Funding outreach

## Steps

1. **Find funded companies** with [people-data-labs/search-companies](../companies/people-data-labs/tools/search-companies.md). List companies matching `target_segment` whose `last_funding_date` falls in the last 30 days. Keep name and domain.
2. **Find the buyer** with [apollo/search-people](../companies/apollo/tools/search-people.md). For each company, find the head of growth or marketing. Keep their name and title.
3. **Write emails**. Draft a three-sentence email per buyer. Show the drafts to the user.
4. **Send** with [lemlist/add-lead-to-campaign](../companies/lemlist/tools/add-lead-to-campaign.md). After the user approves, add each buyer to `campaign`, with `findEmail` so lemlist finds their work email.

## Notes

Optional. Anything else the agent should know, in any markdown.
```

### The header

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | The result, verb first, in 60 characters or fewer. |
| `summary` | yes | One sentence of 140 characters or fewer on what it does. |
| `author` | yes | Your GitHub login (letters, digits, single hyphens). Shown as `@login`, linked to github.com. |
| `motion` | yes | The one `motion:` entry from `tags.yml` it serves, like `outbound`. The site labels and filters workflows by it. |
| `tags` | no | The `channel:` entries from `tags.yml` it reaches people on. Its capabilities come from its tools, and `has:*` from their ways in; both are computed, never listed. |
| `added` | yes | `YYYY-MM-DD`, the day it joins the catalog: write today's date. It never changes after that; the New list sorts by it. |
| `updated` | yes | `YYYY-MM-DD`, the day you last changed it. |
| `featured` | no | `true` puts it first where workflows are browsed with no order picked: agent search, the command palette, and tool and company pages. Set by maintainers; leave it out. |
| `aliases`, `status` | no | Old names to redirect; `published` (default), `deprecated`, or `draft` (checked, never published, and free to use draft tools). A published workflow uses published tools only. |

### The body

Four sections, in this order. Anything else is an error, so a typo in a
heading is caught instead of silently dropped.

| Section | Required | Each entry |
| --- | --- | --- |
| `## Outcome` | yes, 1–4 | `- What the user has when the run ends.` In plain words, with no `code`: people read it to decide, and the agent treats it as the checks that mean it is done. |
| `## Inputs` | no | ``- `name`: what it is, e.g. an example``. The name is snake_case; `, e.g.` and the example are optional. The file tells the agent to ask the user for each one. |
| `## Steps` | yes, 1–10 | ``1. **Title** with [apollo/enrich-person](../companies/apollo/tools/enrich-person.md). What to do.`` The link goes to a published tool's file, `../companies/<handle>/tools/<name>.md`, named by its key (`<handle>/<name>`). GitHub follows it; the file shows each tool's best one or two ways in. A step the agent does itself has no link: ``3. **Write emails**. Draft …`` At least one step names a tool. |
| `## Notes` | no | Free markdown to the end of the file, with `###` and smaller headings, none named like a section the file writes (Set up, Steps, Rules…). |

A long entry can wrap onto the next line; keep each entry to one paragraph.

## Writing it clearly

People scan the title, summary and outcome to decide; the agent reads the
same words to know what it is aiming for.

- **Title**: the result, verb first, with the trigger when there is one:
  "Email buyers at newly funded companies", "Brief the rep the moment a
  meeting is booked". No tool names.
- **Summary**: what it does, in order, and where the result lands: "Finds
  X, does Y, and Z in lemlist." Present tense and US spelling; no words a
  reader can't check, like meaningful or useful.
- **Motion**: the one it serves, even when it touches others.
- **Outcome**: things the user has at the end, such as a table, drafts,
  records or sent emails, in plain words rather than input names. Never a
  promise of replies, meetings or revenue.
- **Inputs**: ask for what the user knows. A campaign's name beats its id
  when the agent can look the id up. When something must be set up once,
  like a campaign template or a CRM property, say so in its description.

## Writing good steps

- One tool per step, or none when the agent can do it alone: writing a draft
  needs no service, so leave the link out rather than add a text API.
- Say what to do with the tool, not how it works. The tool's file already
  explains setup, and its `notes` (an id to fetch first, a result to poll for)
  print in your workflow's Set up.
- End a step with **Keep …** when a later step needs its result: "Keep each
  buyer's name, title and work email." The agent carries exactly that
  forward, so nothing a later step needs is left to guesswork.
- Make a number the user might change an input (`lookback_days`, e.g. 30),
  not a constant in a step.
- Inputs in backticks (`target_segment`), never `{{templates}}`.
- Ask before anything that sends, spends or changes data. The rendered file
  adds these rules itself; do not duplicate them.
- Keep the whole file under 200 lines when rendered: each tool you add brings its setup.

## Checking your work

```bash
pnpm content:check   # every step resolves, every tag exists, the file renders within its caps; each problem names its file, and its line in the body
pnpm dev             # then open /workflows/<name>.md, the file an agent gets
```
