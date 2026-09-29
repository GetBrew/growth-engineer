---
name: add-workflow
description: Write a growth.engineer workflow — workflows/<name>.md, a growth play as up to ten steps across catalog tools, with the outcome the user gets, its one motion and the inputs to ask for — and open a pull request. Use when asked to add, write, contribute or turn a growth hack, GTM play or playbook into a workflow, or to fix an existing workflow so an agent can run it.
---

# Add a workflow

A workflow is a growth play an agent can run from one file: what the user
gets, the tools in order, what to do with each, and what to ask the user for. The format is defined in `workflows/README.md` — read it first and copy
its template; this skill says how to write one that runs.

**Input:** the play, in the user's words ("when someone stars our repo, find
out who they are and reach out"), the user's GitHub login for `author`, and
the services they use. When they don't say which CRM, data provider or email
tool, ask; if they can't say, pick the most widely used tool the catalog has
for the job and name the choice in `## Notes`.
**Output:** `workflows/<name>.md`, any missing tool files, a passing
`pnpm content:check`, and a pull request.

## 1. Name the result and the outcome

- `title` is the result, verb first, in 60 characters or fewer, not the
  method: "Email new GitHub stargazers who fit your ideal customer", not
  "GitHub + PDL + lemlist".
- `summary` is one sentence of 140 characters or fewer on what it does, in
  order: "Finds X, does Y, and Z in <tool>." Present tense, US spelling, no
  words a reader can't check (meaningful, useful, thoughtful).
- `motion` is the one motion it serves, from `tags.yml`.
- `## Outcome` opens the body: one to four things the user has when the run
  ends (a table, drafts, records, sent emails), each one checkable. It is
  what people read to decide and what the agent treats as done. Never a
  promise of replies, meetings or revenue.
- The file name is the key and the URL, forever: short, kebab-case, the play
  (`github-stargazers-outbound`). Check `workflows/` for one that already does
  this; improve it instead of adding a second.

## 2. Find the tools

Every step that calls a service names ONE published tool. Find them in the
catalog, never from memory:

- `ls companies/*/tools/` and `grep -l "^capability: <slug>" companies/*/tools/*.md`
  (the capabilities are in `tags.yml`), or over MCP at the site's `/mcp`
  endpoint: `search` with words or `tags: ["capability:<slug>"]`, then `get` a tool to
  read its calls and `notes`. The same server's `contribute-workflow` prompt
  hands over this guide's short form.
- Read each tool's `summary` and `notes`: they say what the call returns and
  what it needs first (an id, a poll, a credit). A step must ask only for what
  the call can do.
- A step that relies on a filter or parameter (sign-ups since a date, deals in
  a stage) names it when the tool's `notes` or its `docs:` page gives it, so
  the running agent doesn't have to look it up.
- A tool you need is missing? Add it with the `research-company` skill (from
  the vendor's own docs) in the same pull request. Never link a tool that does
  not exist, and never invent a call.
- Writing a draft, picking the best match or summarizing needs no service: that
  step names no tool (`3. **Write emails**. Draft …`), and the agent running the
  file does it itself.

## 3. Write the steps

Up to ten, in `## Steps`, each one paragraph: a bold title, `with` a link to
the tool's file (`../companies/<handle>/tools/<name>.md`, labelled with its
key, as in the template in `workflows/README.md`), then what to do.

- **Say what to keep.** End a step with "Keep …" whenever a later step needs
  its result — every id, email and name a later call takes. Read the steps
  backwards: each value a step uses must be kept by an earlier step or be an
  input.
- **Inputs, not constants.** Anything the user would change — a window, a
  threshold, a channel, a campaign, a link the email points to — is an input
  in `## Inputs`: ``- `snake_case`: what it is, e.g. an example``. Name every
  value a call needs that no step produces (a campaign's custom variable, a
  deal stage, an owner).
- **Ask in the user's words.** A campaign's name beats its id when the agent
  can look the id up with a read-only call. When an input must be set up once
  first (a campaign template, a CRM property, a database), say so in its
  description.
- **Ask before it acts.** Show drafts before anything is sent. The file's Rules
  already say to ask before sending, spending or changing data; don't repeat
  them in every step.
- **Triggers are runs.** A workflow runs when someone runs it. For a "when X
  happens" play, take a `since` input (the last run) so each run handles only
  what is new, and say in `## Notes` to run it on a schedule.
- **Cap the spend.** A step that costs credits per record gets a
  `max_…` input.
- **Consent.** A marketing send goes only to people who opted in: filter on it,
  or have the step confirm it with the user.
- Say what to do with the call, not how the tool works — its setup and notes
  print in the file already.

## 4. Finish the file

- Check the `## Outcome` against the steps: every item is something a step
  (or the agent's closing summary) produces.
- Header: `title`, `summary`, `author` (the GitHub login), `motion` (one
  `motion:` slug from `tags.yml`; its header says what each means), `tags`
  (`channel:` entries only), `updated` (today). Leave `featured` to
  maintainers.

## 5. Check it runs

```bash
pnpm content:check      # every step resolves, every tag exists, the file renders within its caps
pnpm dev                # then open /workflows/<name>.md — the file an agent gets (-p <port> for another port)
```

Then read the rendered file as the agent that will run it: list what you
would ask the user for and every call you would make, step by step. Anything
you would have to guess is a missing input or a missing "Keep". Fix it and
check again.

## 6. Open the pull request

One workflow (plus any tools it needed) per pull request. Say what result it
reaches and which tools it uses; the template asks how you checked it.

## Never

- Link a draft or missing tool, or a call a tool's summary doesn't claim.
- Invent a company, endpoint, field or customer to make a step work.
- Put a key, a real email address or customer data in the file.
- Edit a rendered file or app code to change a workflow.
