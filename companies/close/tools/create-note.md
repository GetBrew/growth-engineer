---
name: Create a note
summary: Logs a note activity on a lead, optionally tied to one of its contacts.
capability: manage-crm
docs: https://developer.close.com/api/resources/activities/notes/create
mcp: create_note
api: POST /activity/note/
updated: 2026-09-27
---

`lead_id` is required. Send the text as plain `note` or rich-text
`note_html`, and set `pinned` to pin the note on the lead.
