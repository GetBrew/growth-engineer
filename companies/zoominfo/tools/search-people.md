---
name: Search people
summary: Returns contacts who match job title, management level, department, company and location filters, with their title and accuracy score but not their emails or phone numbers.
notes: "Filter values such as industries, departments and management levels are ZoomInfo's own: resolve them first with the `lookup` MCP tool, `gtm lookup` or the Lookup Data endpoint. Costs no credits but counts toward request limits. Enrich the people you keep for emails and phones."
capability: find-prospects
docs: https://docs.gtm.ai/reference/searchinterface_searchcontact
mcp: search_contacts
cli: gtm contacts search
api: POST /data/v1/contacts/search
updated: 2026-09-27
---
