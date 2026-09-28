---
name: Create or update a contact
summary: Updates the contact with a matching email address or user ID, or creates it, with properties and mailing list subscriptions.
notes: "Leave `subscribed` out unless you mean to unsubscribe or re-subscribe the contact. Changing a contact's email address needs its `userId`: send the `userId` with the new address."
capability: build-audience
docs: https://loops.so/docs/api-reference/update-contact
mcp: execute
cli: loops contacts update
api: PUT /v1/contacts/update
updated: 2026-09-27
---
