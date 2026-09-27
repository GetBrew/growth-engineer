---
name: Create a prospect
summary: Creates a prospect, the person record Outreach sequences and tasks act on, from a name, emails, title and company, and returns its id.
capability: manage-crm
docs: https://developers.outreach.io/api/reference/prospect/paths/~1prospects/post
mcp: prospect_create
api: POST /prospects
updated: 2026-09-27
---

Required and custom fields differ between orgs: on the MCP server,
`input_fields_fetch` lists them before you create. Over the API, send
`data.type` set to `prospect` with fields such as `firstName`, `lastName`,
`emails` and `title` under `data.attributes`, and link the prospect to an
account through its `account` relationship.
