---
name: Google
domain: google.com
category: email
tagline: Send, draft and search email through the Gmail API, with an MCP server for agent access.
docs: https://developers.google.com/gmail/api
logo: https://cdn.growth.engineer/icons/companies/google-b5a2d723.png
mcp:
  url: https://gmailmcp.googleapis.com/mcp/v1
  auth: oauth
  docs: https://developers.google.com/workspace/gmail/api/guides/configure-mcp-server
  notes: A Developer Preview, open only to Google Workspace accounts in the Workspace Developer Preview Program.
api:
  url: https://gmail.googleapis.com
  auth: oauth
  docs: https://developers.google.com/workspace/gmail/api/reference/rest
updated: 2026-09-29
---

The Gmail API reads and sends mail in a user's own Gmail mailbox, over
OAuth 2.0. Its MCP server exposes drafting and search tools directly; the
REST API adds the send call the MCP server doesn't expose, so a drafted
message still needs a person, or this API, to actually send it.
