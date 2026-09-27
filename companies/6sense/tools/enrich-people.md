---
name: Enrich people
summary: Returns the email, phone numbers, job title, level and company of up to 25 people per call, each matched from an email, a LinkedIn URL or a 6sense people ID.
capability: enrich-contacts
docs: https://api.6sense.com/docs/#people-enrichment-http-request-v2
api: POST /v2/enrichment/people
updated: 2026-09-27
---

Send a JSON array of up to 25 queries, each with one of `email`,
`linkedInUrl` or `peopleId`; the `referenceKeys` you add come back with each
match. Every matched person costs one 6sense Credit, and people on your
exclusion list are left out. Needs the People Enrichment API add-on and
allows up to 20 queries per second.
