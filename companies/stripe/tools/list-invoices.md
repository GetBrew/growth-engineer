---
name: List invoices
summary: Returns invoices newest first, filtered by customer, subscription or status such as paid or open.
capability: track-revenue
docs: https://docs.stripe.com/api/invoices/list
mcp: stripe_api_read
cli: stripe invoices list
api: GET /v1/invoices
updated: 2026-09-26
---

`status` is one of `draft`, `open`, `paid`, `uncollectible` or `void`. Each invoice carries `amount_due`, `amount_paid`, `customer_email` and `status`. On the MCP server this method runs through the generic `stripe_api_read` tool.
