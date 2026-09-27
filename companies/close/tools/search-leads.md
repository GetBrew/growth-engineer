---
name: Search leads and contacts
summary: Returns the leads or contacts that match a query, such as contacts with CTO in their title or leads not contacted in the past week.
capability: manage-crm
docs: https://developer.close.com/api/resources/advanced-filtering
mcp: search
api: POST /data/search/
updated: 2026-09-27
---

The MCP tool takes a plain-language query and returns each match's label,
preview, ID and URL, plus a cursor for `paginate_search`. The API takes a JSON
`query` of `object_type` and `field_condition` clauses and returns only IDs
unless you pass `_fields`. To get a query's JSON, build the filter on the
Leads page in Close and choose Copy Filters.
