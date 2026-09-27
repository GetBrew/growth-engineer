---
name: Search CRM records
summary: Returns contacts, companies, deals or other CRM records that match property filters or a text query.
capability: manage-crm
docs: https://developers.hubspot.com/docs/api-reference/latest/crm/search-the-crm
mcp: search_crm_objects
api: POST /crm/objects/2026-09/{objectType}/search
updated: 2026-09-26
---

Set `objectType` to `contacts`, `companies`, `deals` or another object. Filters within a group combine with AND and groups combine with OR; the MCP tool takes up to five groups of six filters and returns up to 200 records per page.
