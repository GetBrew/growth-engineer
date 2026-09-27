---
name: List customers
summary: Returns customers newest first; pass an email to get only the customers with exactly that address.
capability: track-revenue
docs: https://docs.stripe.com/api/customers/list
mcp: stripe_api_read
cli: stripe customers list
api: GET /v1/customers
updated: 2026-09-26
---

The `email` filter is case-sensitive. Use the returned customer ID with the `customer` filter on subscriptions or invoices to see what that person pays. On the MCP server this method runs through the generic `stripe_api_read` tool.
