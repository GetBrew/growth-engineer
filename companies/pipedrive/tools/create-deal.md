---
name: Create a deal
summary: Creates a deal with a title and, optionally, its pipeline stage, value, currency, person and organization, and returns the new deal.
capability: manage-crm
docs: https://developers.pipedrive.com/docs/api/v1/Deals#addDeal
mcp: addDeal
api: POST /api/v2/deals
updated: 2026-09-27
---

Only `title` is required. Place the deal with `pipeline_id` and `stage_id`,
and link it with `person_id` and `org_id`. Custom fields go in
`custom_fields`, keyed by each field's 40-character hash.
