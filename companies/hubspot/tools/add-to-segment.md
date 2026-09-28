---
name: Add records to a segment
summary: Adds contacts or other records, by ID, to a static segment (list).
notes: Only `MANUAL` or `SNAPSHOT` segments take records; `DYNAMIC` ones follow their filters. The MCP tool asks the user to confirm each write.
capability: build-audience
docs: https://developers.hubspot.com/docs/api-reference/latest/crm/lists/memberships/add-to-list
mcp: manage_segment
api: PUT /crm/lists/2026-09/{listId}/memberships/add
updated: 2026-09-26
---
