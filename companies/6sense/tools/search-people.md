---
name: Search for people
summary: Returns people in 6sense's B2B database who match company domain, job title, level, function, location or industry filters, without their emails or phone numbers.
capability: build-audience
docs: https://api.6sense.com/docs/#people-search-http-request-v2
api: POST /v2/search/people
updated: 2026-09-27
---

Send at least one of `domain`, `industryNAICS`, `email`, `linkedinUrl`,
`country` or `jobTitle`, each a list of up to 10 values. Filters combine as
one flat AND of ORs, such as (Product Manager OR Engineer) AND (US OR
Canada), with no nesting. Page with `pageNo` and `pageSize` (up to 1,000).
Each match says which contact data 6sense holds (`hasEmail`,
`emailConfidence`, `hasPhone`), and `includeInSystemFlag=true` marks people
already in your CRM or MAP. Search costs no credits; enrich the matches by
their people ID to get emails and phone numbers.
