---
name: List customers
summary: Returns active customers, or only those whose email exactly matches one of the addresses you pass.
capability: track-revenue
docs: https://developer.paddle.com/api-reference/customers/list-customers
mcp: execute
api: GET /customers
updated: 2026-09-27
---

Pass up to 100 addresses in `email` as a comma-separated list, or
`status=archived` for archived customers. Use the returned customer ID as
`customer_id` when listing subscriptions or transactions. On the MCP server,
run it with `execute`.
