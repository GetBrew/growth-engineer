# The markdown file

Every company, tool and workflow has one file. Tool and workflow files are the
product; company files are a short index of that company's tools. This is the
contract the renderer (`lib/catalog/render-markdown.ts`) implements and the
goldens in `tests/fixtures/markdown/` pin. The SOURCE files under
`companies/` and `workflows/` are the input to that renderer: a YAML header
of facts and a markdown body a person reads on GitHub. A workflow's body is
already written in this format — its inputs, steps and checks — so the
source and the file read alike; the renderer adds the setup for each tool,
names the tools, and appends the rules.

## Rules

| Rule | Why |
| --- | --- |
| Files are generated, never hand-edited. | One render function builds each file from the source files at build time. When a tool's MCP URL changes, every workflow file that uses it is rebuilt on the next deploy. |
| Files work in any agent. | Plain markdown, a short flat YAML header, no agent-specific syntax. MCP servers appear in the common `mcpServers` JSON shape with the URL spelled out too. |
| Everything needed to run is in the file. | Setup, inputs, steps and finish checks are inline. Links are only for getting keys or reading more. |
| Setup picks the best way in. | Official MCP, then official CLI, then official API, then community options. Tool files list every option; workflow files show at most two per tool. |
| Inputs are named, not templated. | `target_accounts` appears in backticks and the file tells the agent to ask the user for it. No template engine. |
| The file tells the agent to check access first. | After setup, one read-only call to each tool before any step runs. |
| Rules always come last, and nobody can edit them. | Only the listed tools; ask before sending, spending or changing anything; never print keys. |
| Files stay short. | Tool files under ~60 lines; workflow files under ~120, at most 10 steps. |

## Layout

| Section | Tool file | Workflow file |
| --- | --- | --- |
| Header | `ref`, `name`, `company`, `workflows`, `access`, `updated` | `ref`, `title`, `author`, `tools`, `tags`, `updated` |
| Title | Name and a one-line summary | The result, plus one line telling the agent what to do |
| Inputs | — | Named inputs the agent asks the user for |
| Set up | Every way in | The best one or two ways in for each tool |
| Steps | — | Numbered steps, each naming its tool (a workflow using a single tool names it once up front instead) |
| Done when | — | Checks that mean the job is finished |
| Notes | — | Optional, written by the author |
| Rules | Always | Always |

`access` lists the ways in, in setup order.
`workflows` lists every workflow whose steps use the tool, and `tools` in a
workflow file lists the tools it uses: the relationship is in both files.
`author` is the workflow author's GitHub login.

## Where files are served

| Where | Example |
| --- | --- |
| Copy prompt button | On every tool and workflow page |
| `.md` URL | `/tools/clay/enrich-contacts.md`, `/workflows/funding-signal-outbound.md`, `/companies/clay.md` |
| A company, tool or workflow page, asked for markdown | `Accept: text/markdown` |
| Index | `/llms.txt` lists every file |
| MCP, at `/mcp` | `search` finds files; `get` with a ref returns the file |

`proxy.ts` rewrites both forms to `app/api/markdown/[...path]/route.ts`. The
handler reads the rendered document from the in-memory catalog — the same
one the page reads — and every file and every alias is prerendered at
build. A renamed key answers with a real 308.

## The render path

```
companies/ workflows/ tags.yml  (source files, by pull request)
  → lib/content/build-catalog.ts                          validate, resolve, derive
  → lib/content/build-documents.ts                        the ONE caller of the renderer
  → lib/catalog/render-markdown.ts                        pure; goldens
  → catalog.documents { ref, markdown, hash, lineCount, updatedAt }   read by everything
```

Everything renders at build; nothing renders on the request path. A file's
`updated` date is the newest of its inputs, so a workflow file changes when a
tool it uses changes its way in. Two builds of the same tree produce
byte-identical files (`tests/content.test.ts` pins this).

## Publishing a workflow

1. Write `workflows/<name>.md` with your GitHub login as `author`: a header
   with a title phrased as the result, then `## Inputs`, `## Steps` (pick a
   tool, write what to do) and `## Done when`, the checks that mean it is
   done ([`workflows/README.md`](../workflows/README.md)).
2. `pnpm content:check` renders the exact file and lists every problem with
   its file and line; `pnpm dev` shows the page.
3. Open a pull request. CI runs the same checks; a maintainer reviews the
   facts. Merging publishes it on the next deploy.

There are no versions: a merged change replaces the file, and git history is
the archive.
