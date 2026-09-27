---
name: List subscriptions
summary: Returns subscriptions filtered by status, customer or price; with no status it returns every subscription that is not canceled.
capability: track-revenue
docs: https://docs.stripe.com/api/subscriptions/list
mcp: stripe_api_read
cli: stripe subscriptions list
api: GET /v1/subscriptions
aliases:
  - stripe/track-revenue
updated: 2026-09-26
---

Pass `status=active` to get paying subscriptions only, or `customer` to check a single customer. Each subscription carries its `status`, its `customer` ID and the price on each item. On the MCP server this method runs through the generic `stripe_api_read` tool.
