---
name: List invoices
summary: Returns invoices filtered by status, customer or subscription, with their amounts, dates and payment status.
capability: track-revenue
docs: https://apidocs.chargebee.com/docs/api/invoices/list-invoices
api: GET /invoices
updated: 2026-09-27
---

`status[in]` takes `paid`, `posted`, `payment_due`, `not_paid`, `voided` or
`pending`; narrow it with `customer_id[is]` or `subscription_id[is]`. Pages
hold up to 100 with `limit`.
