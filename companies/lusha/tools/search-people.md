---
name: Search for people
summary: Returns preview profiles of contacts who match job title, seniority, department, location and company filters, each listing which emails and phones can be revealed and at what credit cost.
capability: build-audience
docs: https://docs.lusha.com/mcp-docs
mcp: prospecting_contact_search
api: POST /v3/contacts/prospecting
updated: 2026-09-27
---

Job titles are free text; resolve seniority, department and location values
with `prospecting_contact_filters` first, which costs no credits. Scope the
search to accounts with `companyDomains` or `companyNames`, and pass a
`signals` filter to keep only people with a recent promotion or company
change. Previews carry no emails or phones: reveal the people you keep with
`prospecting_contact_enrich`.
