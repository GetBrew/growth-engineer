# The markdown file

Every company, tool and workflow has one file. Tool and workflow files are the
product; company files are a short index of that company's tools. This is the
contract the renderer (`convex/model/render_markdown.ts`) implements and the
goldens in `tests/fixtures/markdown/` pin.

## Rules

| Rule | Why |
| --- | --- |
| Files are generated, never hand-edited. | One render function builds each file from structured fields. When a tool's MCP URL changes, every workflow file that uses it is marked stale and rebuilt. |
| Files work in any agent. | Plain markdown, a short flat YAML header, no agent-specific syntax. MCP servers appear in the common `mcpServers` JSON shape with the URL spelled out too. |
| Everything needed to run is in the file. | Setup, inputs, steps and finish checks are inline. Links are only for getting keys or reading more. |
| Setup picks the best way in. | Official MCP, then official CLI, then official API, then community options. Tool files list every option; workflow files show at most two per tool, or the one a step asks for (`via`). |
| Inputs are named, not templated. | `target_accounts` appears in backticks and the file tells the agent to ask the user for it. No template engine. |
| The file tells the agent to check access first. | After setup, one read-only call to each tool before any step runs. |
| Rules always come last, and nobody can edit them. | Only the listed tools; ask before sending, spending or changing anything; never print keys. |
| Files stay short. | Tool files under ~60 lines; workflow files under ~120, at most 10 steps. |

## Layout

| Section | Tool file | Workflow or hack file |
| --- | --- | --- |
| Header | `ref`, `name`, `company`, `does`, `access`, `agent`, `agent_note`, `updated` | `ref` (with `@N`), `title`, `type`, `tools`, `tags`, `updated` |
| Title | Name and a one-line summary | The result, plus one line telling the agent what to do |
| Inputs | — | Named inputs the agent asks the user for |
| Set up | Every way in | The best one or two ways in for each tool |
| Steps | — | Numbered steps, each naming its tool (a hack omits "with X": there is one tool) |
| What it can do | Capabilities, from tags | — |
| Done when | — | Checks that mean the job is finished |
| Notes | — | Optional, written by the author |
| Rules | Always | Always |

`agent_note` is the tool's level reason without its prefix ("Official remote
MCP with self-serve OAuth."). `does` lists capability slugs. `access` lists
the ways in, in setup order.

## Where files are served

| Where | Example |
| --- | --- |
| Copy prompt button | On every tool and workflow page |
| `.md` URL | `/tools/clay/clay.md`, `/workflows/brew/intent-to-meeting.md`, `/workflows/brew/intent-to-meeting@3.md`, `/companies/clay.md` |
| Any page, when asked for markdown | `Accept: text/markdown` |
| Index | `/llms.txt` lists every file |
| MCP (later) | `get` with a ref returns the file |

`proxy.ts` rewrites both forms to `app/api/markdown/[...path]/route.ts`
before authentication runs. The handler reads one `documents` row through the
same tagged loader the page uses, so `POST /api/revalidate` purges both. A
renamed key answers with a real 308.

## The render path

```
fields (companies, tools, workflowVersions, taggings)
  → convex/documents_render.ts  renderAndStoreDocument()   the ONE caller
  → convex/model/render_markdown.ts                        pure; goldens
  → documents { ref, markdown, hash, lineCount, stale }    read by everything
```

A file whose `hash` did not change is not rewritten — a write re-runs every
live query that read the row. A tool change calls `markStaleForTool`; the
scheduled batch (`documents.renderStale`) re-renders stale files a bounded
number at a time.

## Publishing a workflow (the flow the pipeline will implement)

1. Fill in a short form: a title phrased as the result, the inputs, the steps
   (pick a tool, write what to do), the checks that mean it is done.
2. Watch the file build as you type. The preview is the exact file.
3. Save. The workflow is live at an unlisted link right away.
4. An automated scan checks the steps for data sent to unknown places, hidden
   text, requests for credentials, instructions that override the user.
5. A moderator approves it into search and feeds. Vendors publishing under
   their own handle skip this step; the scan still runs.

Versions are frozen once saved. Edits create version N+1; a flagged version
never replaces the live one. v1 stores the current version's file only; a
pinned older version shows the current file with a notice.
