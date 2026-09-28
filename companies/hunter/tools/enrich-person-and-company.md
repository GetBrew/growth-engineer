---
name: Enrich a person and their company
summary: Returns the profile of the person behind an email address, with their name, location and employment, together with their company's profile, in one call.
notes: A `404` means Hunter has nothing on the person; a `451` means they asked Hunter to stop processing their data, so don't use it.
capability: enrich-contacts
docs: https://hunter.io/api-documentation/v2#combined-enrichment
mcp: Combined-Enrichment
api: GET /combined/find
updated: 2026-09-27
---
