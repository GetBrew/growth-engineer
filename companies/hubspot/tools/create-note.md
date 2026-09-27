---
name: Create a note
summary: Logs a note on the timeline of the contacts, companies or deals it is associated with.
capability: manage-crm
docs: https://developers.hubspot.com/docs/api-reference/latest/crm/activities/notes/create-note
api: POST /crm/objects/2026-09/notes
updated: 2026-09-26
---

Set `hs_timestamp` (required) and `hs_note_body`, and add an `associations` object to attach the note to existing records. The hosted MCP server writes notes through `manage_crm_objects`, the same tool that writes contacts.
