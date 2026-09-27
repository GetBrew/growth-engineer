---
name: Create a note
summary: Adds a note with a title and plaintext or markdown content to a person, company, deal or other record.
capability: manage-crm
docs: https://docs.attio.com/rest-api/endpoint-reference/notes/create-a-note
mcp: create-note
api: POST /v2/notes
updated: 2026-09-26
---

Name the record with `parent_object` (such as `people`) and
`parent_record_id`. The title is plain text only.
