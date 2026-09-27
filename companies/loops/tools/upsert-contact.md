---
name: Create or update a contact
summary: Updates the contact with a matching email address or user ID, or creates it, with properties and mailing list subscriptions.
capability: build-audience
docs: https://loops.so/docs/api-reference/update-contact
mcp: execute
cli: loops contacts update
api: PUT /v1/contacts/update
updated: 2026-09-27
---

Identify the contact by `email` or `userId`. To change a contact's email
address, it needs a `userId`: send the `userId` with the new address. Leave
`subscribed` out unless you mean to unsubscribe or re-subscribe the contact.
Set list membership with `mailingLists` (`--list <id>=true` on the CLI). On
the MCP server, `search`, `describe` and `execute` find, inspect and run this
operation.
