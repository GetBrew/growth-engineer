---
name: Enrich a person and their company
summary: Returns the profile of the person behind an email address, with their name, location and employment, together with their company's profile, in one call.
capability: enrich-contacts
docs: https://hunter.io/api-documentation/v2#combined-enrichment
mcp: Combined-Enrichment
api: GET /combined/find
updated: 2026-09-27
---

Pass an `email` or a `linkedin_handle`; set `clearbit_format` to get a
Clearbit-compatible response. A `404` means Hunter has nothing on the person,
and a `451` means they asked Hunter to stop processing their data: don't use
it. To enrich only the person or only a company, use `Person-Enrichment`
(`GET /people/find`) or `Company-Enrichment` (`GET /companies/find`).
