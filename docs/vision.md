# Vision

growth.engineer is the agent-friendly marketplace for go-to-market tools and
workflows: where a growth engineer — or their agent — finds what exists, what
it can do, how to reach it, and what other people have built with it.

## The problem

Go-to-market tooling is a sprawl: industry standards like Clay next to
features that shipped on Product Hunt last week. Whether the motion is cold
outbound, warm inbound or midbound, finding the right tool means answering the
same questions every time — what does it do, can I get a key without a sales
call, is there an MCP server, who else runs it, how do I combine it with the
rest of my stack — and the answers live in twenty tabs. Handing that to an
agent is worse: docs are written for people, credentials are buried, and the
"workflow" is a Notion page nobody can execute.

## The thesis

**Every tool and workflow is one markdown file any agent can run.** The file
carries the setup (every way in, best first), the inputs to ask for, the
steps, the checks that mean it is done, and the rules — inline, in plain
markdown with a flat header, using no syntax specific to one agent app.
Copying it into any agent is the whole product action. A page is the file
with a button.

That single decision shapes everything else:

- **Result-based, not feature-based.** A workflow is titled by the result it
  reaches ("Turn fresh funding news into qualified outbound"), not by the
  tools inside it.
- **Agent-readable by construction.** Files are generated from structured
  fields by one render function, so they are consistent, current, and never
  hand-edited. Any page answers `Accept: text/markdown` with its file;
  `/llms.txt` indexes all of them.
- **Honest about agent readiness.** A tool's level (unverified, native,
  friendly, possible) comes from rules over checked facts, with the reason
  shown. Nobody has checked it yet? It says so.

## The abstractions

| Entity | Key | What it is |
| --- | --- | --- |
| **Company** | `clay` | A vendor, open-source project or person that makes tools. |
| **Tool** | `clay/enrich-contacts` | ONE function an agent can call, tied to a specific public API endpoint, MCP tool or CLI subcommand of a company's product. Every way in names its `operation`. A company with three functions has three tools. |
| **Workflow** | `brew/intent-to-meeting` | Steps across tools that reach a result. Frozen versions (`@3`); the current one renders the file. |
| **Growth hack** | `brew/clay-waterfall-order` | A workflow. Not a second kind of thing — the word describes the ambition, not the schema, and nothing is keyed off how many tools it uses. |

Each company has many tools. Each workflow combines tools from different
companies. Each tool is reachable over MCP, CLI or API — a tool with no way in
cannot be published.

## Who it is for

- **GTM engineers** choosing and combining tools, and sharing what worked.
- **Their agents** (Claude, ChatGPT, Cursor, anything that reads markdown)
  setting tools up and running workflows without a person copying keys.
- **Vendors**, who claim their listing by verified domain and keep it current.
- **Teams**, who share their stack and publish under their handle.

## Phases

1. **Plan the schema.** Done — `convex/schema.ts` and `docs/data-model.md`.
2. **Seed by hand.** Admins add companies, tools and a first set of workflows;
   each tool needs at least one way in before it is published. *This repo
   ships an illustrative seed to make the shape real.*
3. **Open community submissions.** Signed-in users propose listings and
   publish workflows; vendors edit their own listings directly; every
   published version is scanned, then listed after approval.
4. **Add scheduled discovery.** Jobs find new tools, check that access still
   works, refresh logos. New listings always wait for a person.

## What v1 leaves out, deliberately

Pricing and cost, standalone connector pages, skills/SDKs/webhooks as ways in,
write actions through the API, the admin app, teams and reviews UI, the
submissions pipeline, ranking jobs, vector search, per-IP rate limits. Each is
designed for (the tables exist) and can arrive without changing a key or a
file.

## Principles

- **Files are generated, never hand-edited.** One render function; a tool
  change re-renders every workflow that uses it.
- **Keys never change after publishing.** Names can; keys cannot. Renames
  redirect forever.
- **Reads are open.** Every agent can read everything without signing in.
  Writes arrive with identity.
- **Facts a machine can check apply on their own.** Everything else waits for
  a person.
- **The catalog is honest.** Unverified means unverified. A tool with no way
  in we can stand behind is not published.
