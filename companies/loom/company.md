---
name: Loom
domain: loom.com
category: video
tagline: Screen and meeting recordings with transcripts, AI briefs and action items, shared as a link.
docs: https://support.atlassian.com/loom/
github: https://github.com/loomhq
mcp:
  url: https://mcp.atlassian.com/v2/mcp
  auth: oauth
  docs: https://developer.atlassian.com/cloud/rovo-mcp/
  notes: "This is the Atlassian Rovo MCP server: if Atlassian is already set up, reuse that connection. Deferred Loom tools are found with `discover`."
updated: 2026-09-27
---

Loom, now part of Atlassian, records screen and camera videos and meetings
and adds transcripts, AI briefs and meeting action items. Agents reach Loom
through the Atlassian Rovo MCP server, which reads videos with their
transcripts, comments and action items, and uploads, shares and organizes
videos as the signed-in user. Only Loom workspaces linked to an Atlassian
site are available, and Loom has no open API.

The server lists a few primary tools, such as `getLoomVideo`, directly; the
other Loom tools are deferred: find them with `discover` and run them
through `executeRead`, `executeWrite` or `executeDestructive`, by risk tier.
A client that needs every tool listed up front can connect to
`https://mcp.atlassian.com/v2/mcp?tools=all`. The server signs in with OAuth
2.1; an API token also works once an organization admin enables it.
