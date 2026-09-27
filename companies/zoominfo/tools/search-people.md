---
name: Search for people
summary: Returns contacts who match job title, management level, department, company and location filters, with their title and accuracy score but not their emails or phone numbers.
capability: build-audience
docs: https://docs.gtm.ai/reference/searchinterface_searchcontact
mcp: search_contacts
cli: gtm contacts search
api: POST /data/v1/contacts/search
updated: 2026-09-27
---

Search costs no credits, though each request counts toward your request
limits. Filter values such as industries, departments and management levels
must be ZoomInfo's own: resolve them first with the `lookup` MCP tool,
`gtm lookup` or the Lookup Data endpoint. Each result flags whether ZoomInfo
holds an email, direct phone or mobile phone; enrich the people you keep to
get them.
