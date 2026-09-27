---
name: Create a payment link
summary: Creates a Stripe-hosted checkout link for the prices you pass and returns it with its shareable URL.
capability: collect-payments
docs: https://docs.stripe.com/api/payment-link/create
mcp: stripe_api_write
cli: stripe payment_links create
api: POST /v1/payment_links
aliases:
  - stripe/collect-payments
updated: 2026-09-26
---

Each entry in `line_items` takes a price ID and a quantity, up to 20 per link; the link to send is the `url` in the response. On the MCP server this method runs through the generic `stripe_api_write` tool.
