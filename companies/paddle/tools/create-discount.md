---
name: Create a discount
summary: Creates a flat, per-seat or percentage discount, with a code customers can redeem at checkout, and returns the discount.
notes: "`flat` and `flat_per_seat` amounts are in the currency's lowest denomination, with `currency_code`; a `percentage` takes 0.01 to 100. Over MCP, a live OAuth connection needs write access first."
capability: collect-payments
docs: https://developer.paddle.com/api-reference/discounts/create-discount
mcp: execute
api: POST /discounts
updated: 2026-09-27
---
