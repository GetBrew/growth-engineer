---
name: Create a person
summary: Creates a person (contact) with a name and, optionally, emails, phones, an organization and an owner, and returns the new person.
capability: manage-crm
docs: https://developers.pipedrive.com/docs/api/v1/Persons#addPerson
mcp: addPerson
api: POST /api/v2/persons
updated: 2026-09-27
---

Only `name` is required. Send `emails` and `phones` as arrays of objects with
`value`, `primary` and `label`, and link the person to a company with
`org_id`. `marketing_status` is accepted only when the Campaigns product is
enabled.
