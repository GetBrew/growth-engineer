---
name: Create a coupon
summary: Creates a percent-off or amount-off discount and returns the coupon to apply to invoices and subscriptions.
capability: collect-payments
docs: https://docs.stripe.com/api/coupons/create
mcp: stripe_api_write
cli: stripe coupons create
api: POST /v1/coupons
updated: 2026-09-26
---

Set `percent_off`, or `amount_off` with `currency`. `duration` is `once`, `repeating` (with `duration_in_months`) or `forever`, and `max_redemptions` and `redeem_by` cap how it is used. On the MCP server this method runs through the generic `stripe_api_write` tool.
