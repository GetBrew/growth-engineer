---
name: Enrich a person
summary: Returns email, phone numbers, job title, management level and employer for up to 25 people per call, matched by ZoomInfo person ID, email, phone, profile URL, or name and company.
notes: Each record returned costs one credit unless already enriched in the last 12 months; no match costs nothing. For the surest match, search first and enrich by person ID.
capability: enrich-contacts
docs: https://docs.gtm.ai/reference/enrichinterface_enrichcontact
mcp: enrich_contacts
cli: gtm contacts enrich
api: POST /data/v1/contacts/enrich
updated: 2026-09-27
---
