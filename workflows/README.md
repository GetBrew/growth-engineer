# workflows/

One file per workflow, at `workflows/<owner>/<name>.md`. The path is the key
and the URL: `workflows/brew/funding-signal-outbound.md` is
`brew/funding-signal-outbound` at `/workflows/brew/funding-signal-outbound`.

- **owner** is a handle: a company from `companies/`, or your own handle if
  you are publishing as a person. Lowercase letters, digits and hyphens.
- **name** describes the result, in slug form. Keys never change once
  published; to rename, add the old name under `aliases`.

A workflow is **several tools in order with the instructions that reach a
result**. A growth hack is a workflow — there is no second kind. A workflow
that stays inside one company still names one function per step.

## The file

```markdown
---
title: Turn fresh funding news into qualified outbound
summary: Find recently funded teams, enrich the right buyers, and send a relevant message while the signal is still fresh.
version: 1
tags: [motion:outbound, channel:email, capability:enrich-contacts]
inputs:
  - name: target_segment                    # snake_case; the agent asks the user for it
    description: the kind of company to watch
    example: Series A B2B SaaS in the US
  - name: sender_email
    description: the address emails are sent from
steps:                                      # 1 to 10 steps
  - title: Find funded companies
    tool: clay/build-audience               # a published tool: companies/<handle>/tools/<slug>.md
    instruction: List companies matching `target_segment` that announced a round in the last 30 days.
  - title: Write emails
    tool: brew/write-copy
    via: mcp                                # optional: which way in to use for this step
    instruction: Draft a three-sentence email per contact. Show the drafts to the user.
doneWhen:
  - Every funded company has a contact, or a note explaining why not.
  - Approved emails are sent, and the user has a summary table.
featured: 3                                 # optional: rank on the featured list; must be unique
updated: 2026-09-16
---

Optional notes for the agent, rendered as a "Notes" section in the file.
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Phrased as the result. |
| `summary` | yes | One sentence. |
| `tags` | yes | At least one `namespace:slug` from `tags/` (motion, channel, capability, category, fit). `agent:*` and `has:*` are computed, never listed. |
| `steps` | yes | 1–10. Each names a `tool` that exists and is published; `via` must be a way in that tool has. |
| `doneWhen` | yes | At least one check. |
| `updated` | yes | `YYYY-MM-DD`. |
| `inputs` | no | Named, never templated: the file tells the agent to ask for `target_segment`. |
| `version` | no | Integer, default 1. Bump it when the steps change materially. |
| `featured` | no | Editorial rank on `/workflows`; unranked workflows follow by date. |
| `aliases`, `status` | no | Old keys to redirect; `published` (default) or `deprecated`. |

## Writing good steps

- One tool per step. Say what to do with it, not how the tool works — the
  tool's file already explains setup.
- Inputs in backticks (`target_segment`), never `{{templates}}`.
- Ask before anything that sends, spends or changes data. The rendered file
  adds these rules itself; do not duplicate them.
- Keep the whole file under about 120 lines when rendered.

## Checking your work

```bash
pnpm content:check   # every step resolves, every tag exists, the file renders within its caps
pnpm dev             # then open /workflows/<owner>/<name>
```
