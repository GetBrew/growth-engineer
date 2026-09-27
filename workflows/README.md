# workflows/

One file per workflow, flat: `workflows/<name>.md`. **No folders.** The file
name is the key and the URL: `workflows/funding-signal-outbound.md` is
`funding-signal-outbound` at `/workflows/funding-signal-outbound`.

**Workflows are by people, not companies.** The `author` in the header is
your GitHub login; the page links to your profile and shows your avatar.
Keys never change once published; to rename, add the old name under
`aliases`.

A workflow is **several tools in order with the instructions that reach a
result**. A growth hack is a workflow — there is no second kind. Every step
names one published tool (`companies/<handle>/tools/<name>.md`), so every
workflow is built from defined tools, and every tool page lists the
workflows that use it — the build links both directions.

## The file

A short YAML header with the facts, then the workflow itself in plain
markdown — the same markdown the published file uses, so what you write here
reads the same on GitHub as on the site. The build adds the setup for every
tool you name and the rules; you write the rest.

```markdown
---
title: Turn fresh funding news into qualified outbound
summary: Find recently funded teams, enrich the right buyers, and send a relevant message while the signal is still fresh.
author: jdoe
tags: [motion:outbound, channel:email]
updated: 2026-09-16
---

## Inputs

- `target_segment`: the kind of company to watch, e.g. Series A B2B SaaS in the US
- `sender_email`: the address emails are sent from

## Steps

1. **Find funded companies** with [clay/search-people-and-companies](../companies/clay/tools/search-people-and-companies.md). List companies matching `target_segment` that announced a round in the last 30 days.
2. **Write emails** with [brew/generate-email](../companies/brew/tools/generate-email.md). Draft a three-sentence email per contact. Show the drafts to the user.

## Done when

- Every funded company has a contact, or a note explaining why not.
- Approved emails are sent, and the user has a summary table.

## Notes

Optional. Anything else the agent should know, in any markdown.
```

### The header

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Phrased as the result. |
| `summary` | yes | One sentence. |
| `author` | yes | Your GitHub login (letters, digits, single hyphens). Shown as `@login`, linked to github.com. |
| `tags` | no | The `motion:` and `channel:` entries from `tags.yml` it serves. Its capabilities come from its tools, and `has:*` from their ways in — both computed, never listed. |
| `updated` | yes | `YYYY-MM-DD`. |
| `featured` | no | Editorial rank on `/workflows`, set by maintainers; must be unique. Unranked workflows follow by date. |
| `aliases`, `status` | no | Old names to redirect; `published` (default), `deprecated`, or `draft` — checked, never published, and free to use draft tools. A published workflow uses published tools only. |

### The body

Four sections, in this order. Anything else is an error, so a typo in a
heading is caught instead of silently dropped.

| Section | Required | Each entry |
| --- | --- | --- |
| `## Inputs` | no | ``- `name`: what it is, e.g. an example`` — the name in snake_case; `, e.g.` and the example are optional. The file tells the agent to ask the user for each one. |
| `## Steps` | yes, 1–10 | ``1. **Title** with [apollo/enrich-person](../companies/apollo/tools/enrich-person.md). What to do.`` — a link to a published tool's file, `../companies/<handle>/tools/<name>.md`, named by its key (`<handle>/<name>`). GitHub follows it; the file shows each tool's best one or two ways in. |
| `## Done when` | yes | `- A check that means the job is finished.` |
| `## Notes` | no | Free markdown, to the end of the file — with `###` and smaller headings, none named like a section the file writes (Set up, Steps, Rules…). |

A long entry can wrap onto the next line; keep each entry to one paragraph.

## Writing good steps

- One tool per step. Say what to do with it, not how the tool works — the
  tool's file already explains setup.
- Inputs in backticks (`target_segment`), never `{{templates}}`.
- Ask before anything that sends, spends or changes data. The rendered file
  adds these rules itself; do not duplicate them.
- Keep the whole file under about 120 lines when rendered.

## Checking your work

```bash
pnpm content:check   # every step resolves, every tag exists, the file renders within its caps — each problem names its file and line
pnpm dev             # then open /workflows/<name>
```
