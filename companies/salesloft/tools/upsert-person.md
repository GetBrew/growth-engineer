---
name: Create or update a person
summary: Creates a Salesloft person, or updates the one matched by id, CRM id or email address, and says which it did.
notes: Set `upsert_key` to `id`, `crm_id` or `email_address`; without it an existing person is never updated, and a key matching more than one person fails. Needs the `people:write` scope.
capability: manage-crm
docs: https://developers.salesloft.com/docs/api/person-upserts-create/
api: POST /v2/person_upserts
updated: 2026-09-27
---
