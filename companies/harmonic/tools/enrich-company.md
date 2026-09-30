---
name: Enrich a company
summary: Returns a company's profile — funding, headcount, web traffic and traction — matched by domain, LinkedIn, Crunchbase or another external identifier.
notes: A company not yet in Harmonic's system returns a 404 with an enrichment ID; poll the enrichment status endpoint until it resolves instead of treating the 404 as no match.
capability: enrich-companies
docs: https://console.harmonic.ai/docs/api-reference/introduction
api: POST /companies
updated: 2026-09-29
---
