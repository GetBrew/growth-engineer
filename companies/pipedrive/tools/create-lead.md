---
name: Create a lead
summary: Adds a lead to the Leads Inbox, linked to an existing person, organization or both, and returns it.
capability: manage-crm
docs: https://developers.pipedrive.com/docs/api/v1/Leads#addLead
mcp: addLead
api: POST /api/v1/leads
updated: 2026-09-27
---

Pass a `title` and a `person_id` or `organization_id`: a lead must be linked
to at least one, so create the person or organization first. Set its worth
with `value` as `{ "amount": 200, "currency": "EUR" }`. Leads created through
the API get `API` as their source and origin. Convert a qualified lead into a
deal with `convertLeadToDeal` (`POST /api/v2/leads/{id}/convert/deal`).
