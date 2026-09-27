---
name: Create a record
summary: Creates a person, company, deal or custom-object record, and fails if a unique attribute such as a domain or email address is already taken.
capability: manage-crm
docs: https://docs.attio.com/rest-api/endpoint-reference/records/create-a-record
mcp: create-record
api: POST /v2/objects/{object}/records
updated: 2026-09-26
---

To update the existing record instead of failing on a conflict, upsert it.
