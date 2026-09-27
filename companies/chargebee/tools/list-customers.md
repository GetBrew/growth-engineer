---
name: List customers
summary: Returns customers on your Chargebee site, filtered by email, name or company, to find the billing record for a person or account.
capability: track-revenue
docs: https://apidocs.chargebee.com/docs/api/customers/list-customers
api: GET /customers
updated: 2026-09-27
---

Filter with `email[is]`, `first_name[is]`, `last_name[is]` or `company[is]`.
Pass the returned customer `id` as `customer_id[is]` when listing
subscriptions or invoices to see what they pay.
