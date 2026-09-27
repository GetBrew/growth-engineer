---
name: Add records to a segment
summary: Adds contacts or other records, by ID, to a static segment (list).
capability: build-audience
docs: https://developers.hubspot.com/docs/api-reference/latest/crm/lists/memberships/add-to-list
mcp: manage_segment
api: PUT /crm/lists/2026-09/{listId}/memberships/add
updated: 2026-09-26
---

HubSpot now calls lists segments. Add records to `MANUAL` or `SNAPSHOT` segments; `DYNAMIC` segments are kept in line with their filters. The MCP tool can also create a static segment, and it asks the user to confirm each write.
