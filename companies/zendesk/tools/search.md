---
name: Search tickets, users and organizations
summary: Returns the tickets, users, organizations or groups that match a query in Zendesk's search syntax.
capability: research-accounts
docs: https://developer.zendesk.com/api-reference/ticketing/ticket-management/search/#list-search-results
api: GET /api/v2/search?query={query}
updated: 2026-09-27
---

Narrow the query by type and field, such as `type:ticket status:open` or
`type:user`, and add `sort_by` and `sort_order` to order the results. It
returns at most 1,000 results per query and 100 per page; for more, use the
Export Search Results endpoint, `GET /api/v2/search/export`.
