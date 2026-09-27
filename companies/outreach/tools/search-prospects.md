---
name: Search prospects
summary: Returns Outreach prospects that match filters such as name, account, owner or stage, with their emails, title and engagement counts.
capability: manage-crm
docs: https://developers.outreach.io/api/reference/prospect/paths/~1prospects/get
mcp: prospect_search
api: GET /prospects
updated: 2026-09-27
---

Over the API, filter with query parameters such as `filter[firstName]=Sally`
or `filter[account][id]=1`, and page with `page[limit]` (at most 1,000). On
the MCP server, `filter_schema_fetch` returns the filters each record type
supports, and `prospect_search_by_external_id` finds a prospect by its id in
your CRM.
