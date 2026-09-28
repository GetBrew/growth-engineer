---
name: add-workflow
description: Write a growth.engineer workflow — workflows/<name>.md, a growth play as up to ten steps across catalog tools, with the inputs to ask for and the checks that mean it is done — and open a pull request. Use when asked to add, write, contribute or turn a growth hack, GTM play or playbook into a workflow, or to fix an existing workflow so an agent can run it.
---

# Add a workflow

A workflow is a growth play an agent can run from one file: the tools in
order, what to do with each, what to ask the user for, and how to know it is
done. The format is defined in `workflows/README.md` — read it first and copy
its template; this skill says how to write one that runs.

**Input:** the play, in the user's words ("when someone stars our repo, find
out who they are and reach out"), and the user's GitHub login for `author`.
**Output:** `workflows/<name>.md`, any missing tool files, a passing
`pnpm content:check`, and a pull request.

## 1. Name the result

- `title` is the result, not the method: "Turn new GitHub stargazers into
  qualified conversations", not "GitHub + PDL + lemlist".
- The file name is the key and the URL, forever: short, kebab-case, the play
  (`github-stargazers-outbound`). Check `workflows/` for one that already does
  this; improve it instead of adding a second.

## 2. Find the tools

Every step that calls a service names ONE published tool. Find them in the
catalog, never from memory:

- `ls companies/*/tools/` and `grep -l "^capability: <slug>" companies/*/tools/*.md`
  (the capabilities are in `tags.yml`), or over MCP: `search` with words or a
  `capability` filter, then `get` a tool to read its calls and `notes`.
- Read each tool's `summary` and `notes`: they say what the call returns and
  what it needs first (an id, a poll, a credit). A step must ask only for what
  the call can do.
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
- **Ask before it acts.** Show drafts before anything is sent. The file's Rules
  already say to ask before sending, spending or changing data; don't repeat
  them in every step.
- **Cap the spend.** A step that costs credits per record gets a
  `max_…` input.
- **Consent.** A marketing send goes only to people who opted in: filter on it,
  or have the step confirm it with the user.
- Say what to do with the call, not how the tool works — its setup and notes
  print in the file already.

## 4. Finish the file

- `## Done when`: the checks that mean the job is finished, as results
  ("Every funded company has a contact, or a note explaining why not").
- Header: `title`, `summary` (one sentence), `author` (the GitHub login),
  `tags` (`motion:` and `channel:` entries from `tags.yml` only), `updated`
  (today). Leave `featured` to maintainers.

## 5. Check it runs

```bash
pnpm content:check      # every step resolves, every tag exists, the file renders within its caps
pnpm dev                # then open /workflows/<name>.md — the file an agent gets
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
