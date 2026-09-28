---
name: Search tickets, users and organizations
summary: Returns the tickets, users, organizations or groups that match a query in Zendesk's search syntax.
notes: Returns at most 1,000 results per query and 100 per page; for more, use `GET /api/v2/search/export`.
capability: search-conversations
docs: https://developer.zendesk.com/api-reference/ticketing/ticket-management/search/#list-search-results
api: GET /api/v2/search?query={query}
updated: 2026-09-27
---
