---
name: Create a discount
summary: Creates a flat, per-seat or percentage discount, with a code customers can redeem at checkout, and returns the discount.
capability: collect-payments
docs: https://developer.paddle.com/api-reference/discounts/create-discount
mcp: execute
api: POST /discounts
updated: 2026-09-27
---

`description`, `type` and `amount` are required: a `percentage` discount takes
0.01 to 100, while `flat` and `flat_per_seat` take an amount in the currency's
lowest denomination plus `currency_code`. Set `code` yourself, or Paddle
generates a 10-character code when `enabled_for_checkout` is true. Apply it to
a transaction with `discount_id`. On the MCP server, run it with `execute`; a
live OAuth connection needs write access first.
