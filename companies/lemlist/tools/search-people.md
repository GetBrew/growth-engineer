---
name: Search people
summary: Returns people from lemlist's B2B database who match filters such as country, job title or department, with their LinkedIn profile and current company but no email address.
capability: build-audience
docs: https://developer.lemlist.com/api-reference/endpoints/people-database/search-people-database
mcp: lemleads_search
cli: lemlist api POST /database/people
api: POST /database/people
updated: 2026-09-27
---

Send `filters`, each a `filterId` with `in` and `out` value lists
(`GET /database/filters` lists the filter ids), and optionally a free-text
`search`.
Pages hold up to 100 people (`size`), and searches are limited to a number of
queries every 24 hours, reported in the response's `limitation`. Enrich the
people you keep to get their emails.
