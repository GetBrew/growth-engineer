---
name: Add a customer request to an issue
summary: Attaches a customer's request, with its text and an optional source URL, to an issue, so the issue shows which customers asked for it.
notes: "Customer Requests must be enabled in the workspace settings. The customer must exist first: create it with `customerUpsert`, which matches an existing customer by domain instead of making a duplicate."
capability: manage-tasks
docs: https://linear.app/developers/managing-customers
mcp: save_customer_need
api: POST /graphql
updated: 2026-09-27
---
