---
name: Search people
summary: Returns people from lemlist's B2B database who match filters such as country, job title or department, with their LinkedIn profile and current company but no email address.
notes: Searches are limited to a number of queries every 24 hours, reported in the response's `limitation`; pages hold up to 100 people. Enrich the people you keep to get their emails.
capability: find-prospects
docs: https://developer.lemlist.com/api-reference/endpoints/people-database/search-people-database
mcp: lemleads_search
cli: lemlist api POST /database/people
api: POST /database/people
updated: 2026-09-27
---
