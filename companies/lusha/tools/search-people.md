---
name: Search people
summary: Returns preview profiles of contacts who match job title, seniority, department, location and company filters, each listing which emails and phones can be revealed and at what credit cost.
notes: "Resolve seniority, department and location values with `prospecting_contact_filters` first, which is free. Previews carry no emails or phones: reveal the people you keep with `prospecting_contact_enrich`."
capability: find-prospects
docs: https://docs.lusha.com/mcp-docs
mcp: prospecting_contact_search
api: POST /v3/contacts/prospecting
updated: 2026-09-27
---
