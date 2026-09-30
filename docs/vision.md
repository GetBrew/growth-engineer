# Vision

growth.engineer is an open-source catalog of go-to-market tools and
workflows. It is where a growth engineer, or their agent, finds what exists,
what it can do, how to reach it, and what other people have built with it.

## The problem

Go-to-market tooling sprawls: established products like Clay sit next to
features that launched on Product Hunt last week. Whatever the motion, cold
outbound, warm inbound or anything between, choosing a tool means answering
the same questions each time. What does it do? Can I get a key without a
sales call? Is there an MCP server? Who else uses it, and how do I combine it
with the rest of my stack? The answers are spread across twenty tabs.

Handing that job to an agent is harder still. Docs are written for people,
credentials are buried, and the workflow is a Notion page no one can run.

## The idea

Every tool and workflow is one markdown file any agent can run. The file
carries what it does, the outcome it ends with, the setup (every way in, best
first), the inputs to ask for, the steps, and the rules. It is plain markdown
with a flat header and no syntax tied to one agent app. The main thing a
person does on the site is copy a file into their agent; each page shows the
file with a Copy button.

That decision shapes the rest:

- **Named for the result.** A workflow's title is the result it reaches
  ("Email buyers at newly funded companies"), not the tools inside it, and it
  names the one motion it serves (outbound, inbound, product-led, retention).
- **Readable by agents.** One render function generates every file from
  structured source files, so the files are consistent and current, and no
  one edits them by hand. Every company, tool and workflow page answers
  `Accept: text/markdown` with its file, and `/llms.txt` indexes all of them.
- **Open to pull requests.** Every company, tool and workflow is a markdown
  file in the repository that anyone can add or correct, and the build checks
  every rule before it ships.

## The entities

| Entity | Key | What it is |
| --- | --- | --- |
| **Company** | `apollo` | A vendor, open-source project or person that makes tools. |
| **Tool** | `apollo/enrich-person` | One function an agent can call, tied to a specific public API endpoint, MCP tool or CLI subcommand of a company's product. Every way in names the exact call, so a company with three functions has three tools. |
| **Workflow** | `funding-signal-outbound` | Steps across tools that reach a result, written by a person (a GitHub login). |
| **Growth hack** | `resend-to-unopened` | A workflow. The word describes the ambition, not a different schema, and nothing depends on how many tools a workflow uses. |

A company has many tools, and a workflow combines tools from different
companies. Every tool is reachable over MCP, a CLI or an API; a tool with no
way in can't be published.

## Who it is for

- **GTM engineers** choosing and combining tools, and sharing what worked.
- **Their agents** (Claude, ChatGPT, Cursor, anything that reads markdown),
  setting tools up and running workflows without a person copying keys around.
- **Vendors**, who keep their own folder current by pull request.
- **Teams**, who share the workflows that work for them.

## Phases

1. **Plan the schema.** Done: the file schema is in
   [`data-model.md`](data-model.md).
2. **Seed from the vendors' docs.** Done: every company and tool was
   researched from the vendor's own docs, with every call cited to the page
   that names it (the `research-company` skill), and the first workflows were
   written to run.
3. **Open community contributions.** Now: anyone adds or corrects a file by
   pull request, CI checks every rule, a maintainer reviews the facts, and
   vendors maintain their own folders.
4. **Add scheduled discovery.** Jobs that propose new tools, check that
   access still works and refresh logos, each as a pull request. A new
   listing always waits for a person.

## Left out of v1, on purpose

Pricing and cost, standalone connector pages, skills, SDKs and webhooks as
ways in, write actions through an API, an admin app, teams and reviews,
vector search, and versions with version history. Each can arrive without
changing a key or a file: a pull request is the submission pipeline, and git
is the history. The one usage signal so far is how often each workflow is
copied, which orders the Popular list.

## Principles

- **Files are generated, never hand-edited.** One render function; a change
  to a tool re-renders every workflow that uses it.
- **Keys never change after publishing.** Names can change; keys can't.
  Renames redirect forever.
- **Reads are open.** Any agent can read everything without signing in.
  Writes arrive with an identity, as pull requests.
- **Checks a machine can run apply on their own.** Everything else waits for
  a person.
- **The catalog is honest.** A tool with no way in we can stand behind is
  not published.
