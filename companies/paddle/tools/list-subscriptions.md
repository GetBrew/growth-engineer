---
name: List subscriptions
summary: Returns subscriptions filtered by status, customer or price, 50 per page by default and up to 200.
capability: track-revenue
docs: https://developer.paddle.com/api-reference/subscriptions/list-subscriptions
mcp: execute
api: GET /subscriptions
updated: 2026-09-27
---

`status` takes `active`, `canceled`, `past_due`, `paused` or `trialing`, as a
comma-separated list; `customer_id` and `price_id` narrow it further. Follow
`meta.pagination.next` for the next page. On the MCP server, run it with
`execute`.
