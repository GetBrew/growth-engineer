---
name: Create or update contacts
summary: Creates contacts or updates the ones that already exist with new property values.
capability: manage-crm
docs: https://developers.hubspot.com/docs/api-reference/latest/crm/objects/contacts/batch/upsert-contacts
mcp: manage_crm_objects
api: POST /crm/objects/2026-09/contacts/batch/upsert
aliases:
  - hubspot/manage-crm
updated: 2026-09-26
---

The API takes a batch and matches each contact on `idProperty`: `email` or a custom unique property. On the MCP server, `manage_crm_objects` shows the proposed changes and waits for the user to confirm before it writes.
