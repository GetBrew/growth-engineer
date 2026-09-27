---
name: Enrich a person
summary: Returns email, phone numbers, job title, management level and employer for up to 25 people per call, matched by ZoomInfo person ID, email, phone, profile URL, or name and company.
capability: enrich-contacts
docs: https://docs.gtm.ai/reference/enrichinterface_enrichcontact
mcp: enrich_contacts
cli: gtm contacts enrich
api: POST /data/v1/contacts/enrich
updated: 2026-09-27
---

For the surest match, search first and enrich by person ID. List the fields
you want back in `outputFields`; `requiredFields` drops any match that lacks
one of them. Each record returned costs one credit unless it was already
enriched in the last 12 months, and a request that finds no match costs
nothing.
