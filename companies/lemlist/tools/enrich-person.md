---
name: Enrich a person
summary: Starts a lookup that finds a person's verified email, phone number or LinkedIn profile, or verifies an email you have, and returns an id to fetch the result with.
capability: find-work-emails
docs: https://developer.lemlist.com/api-reference/endpoints/enrich/enrich-data
cli: lemlist api POST /enrich
api: POST /enrich
updated: 2026-09-27
---

Choose what to run with the `findEmail`, `verifyEmail`, `findPhone` and
`linkedinEnrichment` query parameters, and identify the person with an
`email`, a `linkedinUrl`, or a `firstName` and `lastName` with a
`companyDomain` or `companyName`. With the CLI, put them in the path's query
string. Enrichment is asynchronous: fetch the result with
`GET /enrich/{enrichId}` or pass a `webhookUrl`. Each enrichment spends
credits, so confirm before running it on many people.
