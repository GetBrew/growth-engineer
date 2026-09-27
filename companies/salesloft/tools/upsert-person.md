---
name: Create or update a person
summary: Creates a Salesloft person, or updates the one matched by id, CRM id or email address, and says which it did.
capability: manage-crm
docs: https://developers.salesloft.com/docs/api/person-upserts-create/
api: POST /v2/person_upserts
updated: 2026-09-27
---

Set `upsert_key` to `id`, `crm_id` or `email_address` and send that field
with the person's details, such as `first_name`, `last_name`, `title`,
`account_id` and `tags`; without `upsert_key` an existing person is never
updated. The request fails when the key matches more than one person. The
response's `upsert_type` is `create` or `update`. The call needs the
`people:write` scope; the MCP server can't write.
