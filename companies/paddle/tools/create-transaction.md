---
name: Create a transaction
summary: Creates a transaction for the catalog prices or one-off items you pass and returns it with a checkout URL for collecting payment.
notes: Adding `customer_id` and `address_id` makes it `ready`, and completing it creates the related subscription. Over MCP, a live OAuth connection needs write access first.
capability: collect-payments
docs: https://developer.paddle.com/api-reference/transactions/create-transaction
mcp: execute
api: POST /transactions
updated: 2026-09-27
---
