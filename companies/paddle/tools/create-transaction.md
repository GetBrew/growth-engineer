---
name: Create a transaction
summary: Creates a transaction for the catalog prices or one-off items you pass and returns it with a checkout URL for collecting payment.
capability: collect-payments
docs: https://developer.paddle.com/api-reference/transactions/create-transaction
mcp: execute
api: POST /transactions
updated: 2026-09-27
---

List `items` by price ID and quantity. An automatically collected transaction
(the default) is paid at `checkout.url`, your default payment link plus
`?_ptxn=` and the transaction ID. Adding `customer_id` and `address_id` makes
it `ready`, and completing it creates the related subscription. On the MCP
server, find the method with `search` and run it with `execute`; a live OAuth
connection needs write access first.
