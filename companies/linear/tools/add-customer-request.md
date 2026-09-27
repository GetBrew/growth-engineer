---
name: Add a customer request to an issue
summary: Attaches a customer's request, with its text and an optional source URL, to an issue, so the issue shows which customers asked for it.
capability: manage-tasks
docs: https://linear.app/developers/managing-customers
mcp: save_customer_need
api: POST /graphql
updated: 2026-09-27
---

Customer Requests must be enabled in the workspace settings; they are
available on every Linear plan. On the API, send `customerNeedCreate` with the
`issueId`, the request `body` and either the Linear `customerId` or one of the
customer's `customerExternalId` values; an `attachmentUrl`, such as a support
conversation or call link, is saved as the request's source. To create the
customer first without making a duplicate, `customerUpsert` matches an
existing customer by domain and merges in your external id.
